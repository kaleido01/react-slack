import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import { connect } from "react-redux";

import firebase from "../../firebase";

import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import { setUserPosts } from "../../actions/index";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends React.Component {
	state = {
		privateMessagesRef: firebase.database().ref("privateMessages"),
		messagesRef: firebase.database().ref("messages"),
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		messagesLoading: true,
		messages: [],
		isChannelStarred: false,
		usersRef: firebase.database().ref("users"),
		progressBar: false,
		numUniqueUsers: "",
		searchTerm: "",
		searchLoading: false,
		searchResults: [],
		privateChannel: this.props.privateChannel,
		typingRef: firebase.database().ref("typing"),
		typingUsers: [],
		connectedRef: firebase.database().ref(".info/connected"),
		listeners: []
	};

	componentDidMount() {
		const { channel, user, listeners } = this.state;
		if (user && channel) {
			this.removeListeners(listeners);
			this.addListners(channel.id);
			this.adduserStarsListener(channel.id, user.uid);
		}
	}

	componentWillUnmount() {
		this.removeListeners(this.state.listeners);
		this.state.connectedRef.off();
	}

	removeListeners = listeners => {
		listeners.forEach(listener => {
			listener.ref.child(listener.id).off(listener.event);
		});
	};

	componentDidUpdate(prevProps, prevState) {
		if (this.messagesEnd) {
			this.scrollToBottom();
		}
	}

	addTolisteners = (id, ref, event) => {
		const index = this.state.listeners.findIndex(listener => {
			return (
				listener.id === id && listener.ref === ref && listener.event === event
			);
		});
		if (index === -1) {
			const newListener = { id, ref, event };
			this.setState({ listeners: this.state.listeners.concat(newListener) });
		}
	};

	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	};

	addListners = channelId => {
		this.addMessageListener(channelId);
		this.addTypingListeners(channelId);
	};

	addTypingListeners = channelId => {
		let typingUsers = [];
		this.state.typingRef.child(channelId).on("child_added", snap => {
			if (snap.key !== this.state.user.uid) {
				typingUsers = typingUsers.concat({
					id: snap.key,
					name: snap.val()
				});
				this.setState({ typingUsers });
			}
		});

		this.addTolisteners(channelId, this.state.typingRef, "child_added");

		this.state.typingRef.child(channelId).on("child_removed", snap => {
			const index = typingUsers.findIndex(user => user.id === snap.key);

			if (index !== -1) {
				typingUsers = typingUsers.filter(user => user.id !== snap.key);
				this.setState({ typingUsers });
			}
		});
		this.addTolisteners(channelId, this.state.typingRef, "child_removed");

		this.state.connectedRef.on("value", snap => {
			if (snap.val() === true) {
				this.state.typingRef
					.child(channelId)
					.child(this.state.user.uid)
					.onDisconnect()
					.remove(err => {
						if (err !== null) {
							console.log(err);
						}
					});
			}
		});
	};

	addMessageListener = channelId => {
		let loadedMessages = [];
		const ref = this.getMessagesRef();
		ref.child(channelId).on("child_added", snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
			this.countUniqueUsers(loadedMessages);
			this.countUserPosts(loadedMessages);
		});
		this.addTolisteners(channelId, ref, "child_added");
	};

	adduserStarsListener = (channelId, userId) => {
		//onceはデータの1回読み取り
		this.state.usersRef
			.child(userId)
			.child("starred")
			.once("value")
			.then(data => {
				if (data.val() !== null) {
					console.log(data.val());
					//全てのチャンネルデータはオブジェクト型それのキーを取り出している
					const channelIds = Object.keys(data.val());
					console.log(channelIds);

					const prevStarred = channelIds.includes(channelId);
					this.setState({ isChannelStarred: prevStarred });
				}
			});
	};

	getMessagesRef = () => {
		const { messagesRef, privateMessagesRef, privateChannel } = this.state;
		return privateChannel ? privateMessagesRef : messagesRef;
	};

	countUniqueUsers = messages => {
		const uniqueUsers = messages.reduce((acc, message) => {
			if (!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
		const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
		this.setState({ numUniqueUsers });
	};

	handleStar = () => {
		this.setState(
			prevState => ({
				isChannelStarred: !prevState.isChannelStarred
			}),
			() => this.starChannel()
		);
	};

	countUserPosts = messages => {
		let userPosts = messages.reduce((acc, message) => {
			if (message.user.name in acc) {
				acc[message.user.name].count += 1;
			} else {
				acc[message.user.name] = {
					avatar: message.user.avatar,
					count: 1
				};
			}
			return acc;
		}, {});
		this.props.setUserPosts(userPosts);
	};

	starChannel = () => {
		if (this.state.isChannelStarred) {
			this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
				[this.state.channel.id]: {
					name: this.state.channel.name,
					details: this.state.channel.details,
					createdBy: {
						name: this.state.channel.createdBy.name,
						avatar: this.state.channel.createdBy.avatar
					}
				}
			});
		} else {
			this.state.usersRef
				.child(`${this.state.user.uid}/starred`)
				.child(this.state.channel.id)
				.remove(err => {
					if (err !== null) {
						console.error(err);
					}
				});
		}
	};
	displayMessages = messages => {
		return (
			messages.length > 0 &&
			messages.map(message => (
				<Message
					key={message.timestamp}
					message={message}
					user={this.state.user}
				/>
			))
		);
	};

	displayTypingUsers = users => {
		console.log(users);
		return (
			users.length > 0 &&
			users.map(user => (
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginBottom: "0.2em"
					}}
					key={user.id}>
					<span className="user_typing">{user.name} is typing</span>
					<Typing />
				</div>
			))
		);
	};

	isProgressBarVisible = percent => {
		if (percent > 0) {
			this.setState({ progressBar: true });
		}
	};

	handleSearchChange = event => {
		this.setState(
			{
				searchTerm: event.target.value,
				searchLoading: true
			},
			() => this.handleSearchMessages()
		);
	};

	handleSearchMessages = () => {
		const channelMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, "gi");
		const searchResults = channelMessages.reduce((acc, message) => {
			if (
				(message.content && message.content.match(regex)) ||
				message.user.name.match(regex)
			) {
				acc.push(message);
			}
			return acc;
		}, []);
		this.setState({ searchResults });
		setTimeout(() => this.setState({ searchLoading: false }), 3000);
	};

	displayChannelName = channel => {
		return channel
			? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
			: "";
	};

	displayMessageSkeleton = loading =>
		loading ? (
			<React.Fragment>
				{[...Array(10)].map((_, i) => (
					<Skeleton key={i} />
				))}
			</React.Fragment>
		) : null;

	render() {
		const {
			messagesRef,
			channel,
			user,
			messages,
			progressBar,
			numUniqueUsers,
			searchTerm,
			searchResults,
			searchLoading,
			privateChannel,
			isChannelStarred,
			typingUsers,
			messagesLoading
		} = this.state;

		return (
			<React.Fragment>
				<MessagesHeader
					channelName={this.displayChannelName(channel)}
					numUniqueUsers={numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
					isPrivateChannel={privateChannel}
					isChannelStarred={isChannelStarred}
					handleStar={this.handleStar}
				/>
				<Segment>
					<Comment.Group
						className={progressBar ? "messages__progress" : "messages"}>
						{this.displayMessageSkeleton(messagesLoading)}
						{searchTerm
							? this.displayMessages(searchResults)
							: this.displayMessages(messages)}
						{this.displayTypingUsers(typingUsers)}
						<div ref={node => (this.messagesEnd = node)} />
					</Comment.Group>
				</Segment>
				<MessageForm
					messagesRef={messagesRef}
					currentChannel={channel}
					currentUser={user}
					isProgressBarVisible={this.isProgressBarVisible}
					isPrivateChannel={privateChannel}
					getMessagesRef={this.getMessagesRef}
				/>
			</React.Fragment>
		);
	}
}

export default connect(
	null,
	{ setUserPosts }
)(Messages);
