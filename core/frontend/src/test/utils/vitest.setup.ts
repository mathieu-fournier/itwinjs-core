import { WebGLRenderingContext } from "gl";
// import "jsdom-worker";
// Exposes WebGLRenderingContext, normally not availble in node processes, to globalThis
global.WebGLRenderingContext = WebGLRenderingContext;
