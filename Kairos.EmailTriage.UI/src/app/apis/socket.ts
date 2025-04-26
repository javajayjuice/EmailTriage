import { Ticket } from '@/models';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const connections = {} as { [key: string]: { type: string; connection: HubConnection; started: boolean } };

function createConnection(messageType: string) {
    const connectionObj = connections[messageType];
    if (!connectionObj) {
        console.log('SOCKET: Registering on server events ', messageType);
        const connection = new HubConnectionBuilder()
            .withUrl('https://localhost:44311/hub', {
                logger: LogLevel.Information,
                withCredentials: false,
            })
            .withAutomaticReconnect()
            .build();

        connections[messageType] = {
            type: messageType,
            connection: connection,
            started: false,
        };
        return connection;
    } else {
        return connections[messageType].connection;
    }
}

function startConnection(messageType: string) {
    const connectionObj = connections[messageType];
    if (!connectionObj.started) {
        connectionObj.connection.start().catch(err => console.error('SOCKET: ', err.toString()));
        connectionObj.started = true;
    }
}

function stopConnection(messageType: string) {
    const connectionObj = connections[messageType];
    if (connectionObj) {
        console.log('SOCKET: Stoping connection ', messageType);
        connectionObj.connection.stop();
        connectionObj.started = false;
    }
}

function registerOnServerEvents(
    messageType: string,
    callback: (payload: Ticket[]) => void,
) {
    try {
        const connection = createConnection(messageType);
        connection.on('Tickets', (payload: Ticket[]) => {
            callback(payload);
        });
        connection.onclose(() => stopConnection(messageType));
        startConnection(messageType);
    } catch (error) {
        console.error('SOCKET: ', error);
    }
}

export const socketService = {
    registerOnServerEvents,
    stopConnection,
};