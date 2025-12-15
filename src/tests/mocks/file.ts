/**
 * File mock helper for tests
 */

export function createMockFile(
  content: string | Uint8Array | ArrayBuffer,
  filename: string,
  mimeType?: string
): File {
  // Convert content to ArrayBuffer for storage
  let buffer: ArrayBuffer;
  if (typeof content === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(content).buffer;
  } else if (content instanceof ArrayBuffer) {
    buffer = content;
  } else {
    buffer = content.buffer;
  }
  
  const file = Object.create(File.prototype);
  
  Object.defineProperty(file, 'name', { value: filename, writable: false });
  Object.defineProperty(file, 'type', { value: mimeType || '', writable: false });
  Object.defineProperty(file, 'size', { value: buffer.byteLength, writable: false });
  
  file.arrayBuffer = async () => {
    return buffer.slice(0);
  };
  
  file.text = async () => {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  };
  
  file.slice = (start?: number, end?: number) => {
    return createMockFile(
      buffer.slice(start || 0, end || buffer.byteLength),
      filename,
      mimeType
    );
  };
  
  return file as File;
}
