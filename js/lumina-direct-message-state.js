export function createPendingDirectMessage(message, localId, timestampMs = Date.now()) {
    return {
        ...message,
        id: localId,
        status: 'pending',
        delivered: false,
        timestamp: { seconds: timestampMs / 1000 }
    };
}

export function withFirestoreWriteState(message, hasPendingWrites) {
    return hasPendingWrites
        ? { ...message, status: 'pending', delivered: false }
        : message;
}

export function reconcilePersistedDirectMessage(messages, { clientMessageId, localId, messageId, deliveredAt = Date.now() }) {
    const list = Array.isArray(messages) ? messages : [];
    const previous = list.find(message => message.id === messageId)
        || list.find(message => clientMessageId && message.id !== localId && message.clientMessageId === clientMessageId)
        || list.find(message => message.id === localId)
        || {};
    const persisted = {
        ...previous,
        id: messageId,
        status: 'sent',
        delivered: true,
        deliveredAt
    };
    return [
        ...list.filter(message =>
            message.id !== localId &&
            message.id !== messageId &&
            !(clientMessageId && message.clientMessageId === clientMessageId)
        ),
        persisted
    ];
}

export function removePendingDirectMessage(messages, { clientMessageId, localId }) {
    const list = Array.isArray(messages) ? messages : [];
    return list.filter(message =>
        message.id !== localId &&
        !(clientMessageId && message.clientMessageId === clientMessageId)
    );
}

export async function persistThenDispatch(writeMessage, onPersisted, dispatchPush) {
    const messageRef = await writeMessage();
    try {
        onPersisted?.(messageRef);
    } catch (error) {
        console.warn('Direct message local confirmation notice:', error?.message || error);
    }
    try {
        await dispatchPush?.(messageRef.id);
    } catch (error) {
        console.warn('Direct message push dispatch notice:', error?.message || error);
    }
    return messageRef;
}
