import { socket } from "@/app/lib/socket";


export function getSocketId(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (socket.connected && socket.id) {
      resolve(socket.id);
      return;
    }

    const handleConnect = (): void => {
      cleanup();

      if (!socket.id) {
        reject(
          new Error(
            "Socket connected without a socket ID"
          )
        );
        return;
      }

      resolve(socket.id);
    };

    const handleConnectError = (
      error: Error
    ): void => {
      cleanup();
      reject(error);
    };

    const cleanup = (): void => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );
    };

    socket.once(
      "connect",
      handleConnect
    );

    socket.once(
      "connect_error",
      handleConnectError
    );

    if (!socket.connected) {
      socket.connect();
    }
  });
}