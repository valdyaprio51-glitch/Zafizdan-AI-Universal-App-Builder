import * as net from 'net';

export class PortAllocator {
  private static allocatedPorts = new Set<number>();
  private static readonly START_PORT = 5100;
  private static readonly END_PORT = 5999;

  static async allocate(): Promise<number> {
    for (let port = this.START_PORT; port <= this.END_PORT; port++) {
      if (this.allocatedPorts.has(port)) continue;

      const isAvailable = await this.checkPortAvailable(port);
      if (isAvailable) {
        this.allocatedPorts.add(port);
        return port;
      }
    }
    throw new Error('No available ports in range 5100-5999');
  }

  static release(port: number): void {
    this.allocatedPorts.delete(port);
  }

  private static checkPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.unref();
      server.on('error', () => resolve(false));
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
    });
  }
}
