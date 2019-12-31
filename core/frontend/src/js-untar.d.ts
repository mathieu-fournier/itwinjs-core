/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
declare module 'js-untar';

declare function untar(buffer: ArrayBuffer): Promise<Array<ExtractedFile>>;

