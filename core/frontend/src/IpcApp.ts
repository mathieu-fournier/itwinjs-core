/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module NativeApp
 */

import { AsyncMethodsOf, PickAsyncMethods, PromiseReturnType } from "@itwin/core-bentley";
import {
  BackendError, constructors, IModelError, IModelStatus, ipcAppChannels, IpcAppFunctions, IpcAppNotifications, IpcInvokeReturn, IpcListener, IpcSocketFrontend,
  iTwinChannel, RemoveFunction,
} from "@itwin/core-common";
import { IModelApp, IModelAppOptions } from "./IModelApp";

/**
 * Options for [[IpcApp.startup]]
 * @public
 */
export interface IpcAppOptions {
  iModelApp?: IModelAppOptions;
}

/**
 * The frontend of apps with a dedicated backend that can use [Ipc]($docs/learning/IpcInterface.md).
 * @public
 */
export class IpcApp {
  private static _ipc: IpcSocketFrontend | undefined;
  /** Get the implementation of the [[IpcSocketFrontend]] interface. */

  private static get ipc(): IpcSocketFrontend { return this._ipc!; }

  /** Determine whether Ipc is available for this frontend. This will only be true if [[startup]] has been called on this class. */
  public static get isValid(): boolean { return undefined !== this._ipc; }

  /**
   * Establish a message handler function for the supplied channel over Ipc. The handler will be called when messages are sent for
   * the channel via  [[BackendIpc.send]].
   * @param channel the name of the channel
   * @param handler the message handler
   * @returns A function to remove the handler
   * @note Ipc is only supported if [[isValid]] is true.
   */
  public static addListener(channel: string, handler: IpcListener): RemoveFunction {
    return this.ipc.addListener(iTwinChannel(channel), handler);
  }

  /**
   * Remove a previously registered listener
   * @param channel The name of the channel for the listener previously registered with [[addListener]]
   * @param listener The function passed to [[addListener]]
   */
  public static removeListener(channel: string, listener: IpcListener) {
    this.ipc.removeListener(iTwinChannel(channel), listener);
  }

  /**
   * Send a message to the backend via `channel` and expect a result asynchronously. The handler must be established on the backend via [[BackendIpc.handle]]
   * @param channel The name of the channel for the method.
   * @see Electron [ipcRenderer.invoke](https://www.electronjs.org/docs/api/ipc-renderer) documentation for details.
   * Note that this interface may be implemented via Electron for desktop apps, or via
   * [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) for mobile or web-based
   * Ipc connections. In either case, the Electron documentation provides the specifications for how it works.
   * @note `args` are serialized with the [Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), so only
   * primitive types and `ArrayBuffers` are allowed.
   */
  public static async invoke(channel: string, ...args: any[]): Promise<any> {
    return this.ipc.invoke(iTwinChannel(channel), ...args);
  }

  /**
   * Send a message over the socket.
   * @param channel The name of the channel for the message.
   * @param data The optional data of the message.
   * @note `data` is serialized with the [Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), so only
   * primitive types and `ArrayBuffers` are allowed.
   */
  public static send(channel: string, ...data: any[]) {
    return this.ipc.send(iTwinChannel(channel), ...data);
  }

  /**
   * Call a method on the backend through an Ipc channel.
   * @param channelName the channel registered by the backend handler.
   * @param methodName  the name of a method implemented by the backend handler.
   * @param args arguments to `methodName`
   * @return a Promise with the return value from `methodName`
   * @note If the backend implementation throws an exception, this method will throw a [[BackendError]] exception
   * with the `errorNumber` and `message` from the backend.
   * @note Ipc is only supported if [[isValid]] is true.
   * @internal Use [[makeIpcProxy]] for a type-safe interface.
   */
  public static async callIpcChannel(channelName: string, methodName: string, ...args: any[]): Promise<any> {
    const retVal = (await this.invoke(channelName, methodName, ...args)) as IpcInvokeReturn;

    if ("constructorName" in retVal) {
      const constructorName = retVal.constructorName;
      const constructor = constructors[constructorName];
      if (constructor) {
        const newObj = new constructor(...retVal.args);
        throw newObj;
      }
    } else if (undefined !== retVal.error) {
      // retVal.key
      // if (retVal.error.conflictingLocks !== undefined || retVal.conflictingLocks !== undefined) {
      //   const err = new ConflictingLocksError(retVal.error.message, undefined, retVal.error.conflictingLocks);
      //   err.stack = retVal.error.stack;
      //   throw err;
      // } else if (retVal.error instanceof ConflictingLocksError) {
      //   const err = new ConflictingLocksError(retVal.error.message, undefined, retVal.error.conflictingLocks);
      //   err.stack = retVal.error.stack;
      //   throw err;
      // } else {
      const err = new BackendError(retVal.error.errorNumber, retVal.error.name, retVal.error.message);
      err.stack = retVal.error.stack;
      throw err;
    }
    return retVal.result;
  }

  /** Create a type safe Proxy object to make IPC calls to a registered backend interface.
   * @param channelName the channel registered by the backend handler.
   */
  public static makeIpcProxy<K>(channelName: string): PickAsyncMethods<K> {
    return new Proxy({} as PickAsyncMethods<K>, {
      get(_target, methodName: string) {
        return async (...args: any[]) =>
          IpcApp.callIpcChannel(channelName, methodName, ...args);
      },
    });
  }

  /** Create a type safe Proxy object to call an IPC function on a of registered backend handler that accepts a "methodName" argument followed by optional arguments
   * @param channelName the channel registered by the backend handler.
   * @param functionName the function to call on the handler.
   * @internal
   */
  public static makeIpcFunctionProxy<K>(channelName: string, functionName: string): PickAsyncMethods<K> {
    return new Proxy({} as PickAsyncMethods<K>, {
      get(_target, methodName: string) {
        return async (...args: any[]) =>
          IpcApp.callIpcChannel(channelName, functionName, methodName, ...args);
      },
    });
  }

  /** @deprecated in 3.x. use [[appFunctionIpc]] */
  public static async callIpcHost<T extends AsyncMethodsOf<IpcAppFunctions>>(methodName: T, ...args: Parameters<IpcAppFunctions[T]>) {
    return this.callIpcChannel(ipcAppChannels.functions, methodName, ...args) as PromiseReturnType<IpcAppFunctions[T]>;
  }

  /** A Proxy to call one of the [IpcAppFunctions]($common) functions via IPC. */
  public static appFunctionIpc = IpcApp.makeIpcProxy<IpcAppFunctions>(ipcAppChannels.functions);

  /** start an IpcApp.
   * @note this should not be called directly. It is called by NativeApp.startup */
  public static async startup(ipc: IpcSocketFrontend, opts?: IpcAppOptions) {
    this._ipc = ipc;
    IpcAppNotifyHandler.register(); // receives notifications from backend
    await IModelApp.startup(opts?.iModelApp);
  }

  /** @internal */
  public static async shutdown() {
    this._ipc = undefined;
    await IModelApp.shutdown();
  }
}

/**
 * Base class for all implementations of an Ipc notification response interface. This class is implemented on your frontend to supply
 * methods to receive notifications from your backend.
 *
 * Create a subclass to implement your Ipc response interface. Your class should be declared like this:
 * ```ts
 * class MyNotificationHandler extends NotificationHandler implements MyNotifications
 * ```
 * to ensure all method names and signatures are correct. Your methods cannot have a return value.
 *
 * Then, call `MyNotificationHandler.register` at startup to connect your class to your channel.
 * @public
 * @extensions
 */
export abstract class NotificationHandler {
  /** All subclasses must implement this method to specify their response channel name. */
  public abstract get channelName(): string;

  public registerImpl(): RemoveFunction {
    return IpcApp.addListener(this.channelName, (_evt: Event, funcName: string, ...args: any[]) => {
      const func = (this as any)[funcName];
      if (typeof func !== "function")
        throw new IModelError(IModelStatus.FunctionNotFound, `Method "${this.constructor.name}.${funcName}" not found on NotificationHandler registered for channel: ${this.channelName}`);

      func.call(this, ...args);
    });
  }

  /**
   * Register this class as the handler for notifications on its channel. This static method creates a new instance
   * that becomes the notification handler and is `this` when its methods are called.
   * @returns A function that can be called to remove the handler.
   * @note this method should only be called once per channel. If it is called multiple times, multiple handlers are established.
   */
  public static register(): RemoveFunction {
    return (new (this as any)() as NotificationHandler).registerImpl(); // create an instance of subclass. "as any" is necessary because base class is abstract
  }
}

/** IpcApp notifications from backend */
class IpcAppNotifyHandler extends NotificationHandler implements IpcAppNotifications {
  public get channelName() { return ipcAppChannels.appNotify; }
  public notifyApp() { }
}
