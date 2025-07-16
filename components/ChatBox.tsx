import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Player } from '../types';
import { GENERATION_COLORS } from '../constants';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    currentPlayer: Player;
    allPlayers: Player[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, currentPlayer, allPlayers }) => {
    const [text, setText] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
        }
    };

    const getPlayerForMessage = (message: ChatMessage) => {
        return allPlayers.find(p => p.id === message.senderId);
    }

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bebas text-cyan-300 tracking-wider mb-2 flex-shrink-0">Lobby Chat</h3>
            <div className="flex-grow bg-black/20 rounded-lg p-2 overflow-y-auto h-48 md:h-64">
                {messages.map((msg, index) => {
                    const senderPlayer = getPlayerForMessage(msg);
                    const senderColor = senderPlayer ? GENERATION_COLORS[senderPlayer.generation] : 'bg-gray-500';
                    const isCurrentUser = msg.senderId === currentPlayer.id;
                    return (
                        <div key={index} className={`mb-2 text-sm ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                           <p className={`inline-block py-1 px-2 rounded-lg ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                             <span className={`font-bold mr-2 ${senderColor} px-1 rounded`}>{msg.sender}</span>
                             {msg.text}
                           </p>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-2 flex gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Say something..."
                    className="flex-grow p-2 bg-slate-900 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    maxLength={100}
                />
                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg font-bebas tracking-wider"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
