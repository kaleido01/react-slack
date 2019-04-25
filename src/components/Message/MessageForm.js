import React from "react";
import uuidv4 from "uuid/v4";
import { Segment, Input, Button } from "semantic-ui-react";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import firebase from "./../../firebase";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

class MessageForm extends React.Component {
	state = {
		storageRef: firebase.storage().ref(),
		typingRef: firebase.database().ref("typing"),
		uploadTask: null,
		uploadState: "",
		percentUploaded: 0,
		message: "",
		loading: false,
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		errors: [],
		modal: false,
		emojiPicker: false,
		openToast: false
	};

	componentWillUnmount() {
		if (this.state.uploadTask !== null) {
			this.state.uploadTask.cancel();
			this.setState({ uploadTask: null });
		}
	}

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	handleKeyDown = event => {
		if (event.ctrlKey && event.keyCode === 13) {
			this.sendMessage();
		}
		const { message, typingRef, channel, user } = this.state;

		if (message) {
			typingRef
				.child(channel.id)
				.child(user.uid)
				.set(user.displayName);
		} else {
			typingRef
				.child(channel.id)
				.child(user.uid)
				.remove();
		}
	};

	handleTogglePicker = () => {
		this.setState({ emojiPicker: !this.state.emojiPicker });
	};

	handleAddEmoji = emoji => {
		const oldMessage = this.state.message;
		const newMessage = this.colonToUnicode(` ${oldMessage}${emoji.colons}`);
		this.setState({ message: newMessage, emojiPicker: false });
		setTimeout(() => this.messageInputRef.focus(), 0);
	};

	colonToUnicode = message => {
		return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
			x = x.replace(/:/g, "");
			let emoji = emojiIndex.emojis[x];
			if (typeof emoji !== "undefined") {
				let unicode = emoji.native;
				if (typeof unicode !== "undefined") {
					return unicode;
				}
			}
			x = ":" + x + ":";
			return x;
		});
	};

	createMessage = (fileUrl = null) => {
		const message = {
			timeStamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			}
		};
		//fileアップロードがメッセージ投稿かで内容が変化する
		if (fileUrl !== null) {
			message["image"] = fileUrl;
		} else {
			message["content"] = this.state.message;
		}

		return message;
	};

	sendMessage = () => {
		const { getMessagesRef } = this.props;
		const { message, channel, typingRef, user } = this.state;

		if (message) {
			this.setState({ loading: true });
			getMessagesRef()
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: "", errors: [] });
					typingRef
						.child(channel.id)
						.child(user.uid)
						.remove();
					console.log("finish");
				})
				.catch(err => {
					console.error(err);
					this.setState({
						loading: false,
						message: "",
						errors: this.state.errors.concat(err)
					});
				});
		} else {
			this.setState({
				errors: this.state.errors.concat({ message: "Add a message" })
			});
		}
	};

	getPath = () => {
		if (this.props.isPrivateChannel) {
			return `chat/private/${this.state.channel.id}`;
		} else {
			return `chat/public`;
		}
	};

	uploadFile = (file, metadata) => {
		const pathToUpload = this.state.channel.id;
		const ref = this.props.getMessagesRef();
		//画像ファイルの場所はプライベートかどうかで分ける
		const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

		this.setState(
			{
				uploadState: "uploading",
				uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
			},
			() => {
				this.state.uploadTask.on(
					"state_changed",
					snap => {
						const percentUploaded = Math.round(
							(snap.bytesTransferred / snap.totalBytes) * 100
						);
						this.setState({ percentUploaded });
						this.props.isProgressBarVisible(percentUploaded);
					},
					err => {
						console.error(err);
						this.setState({
							errors: this.state.errors.concat(err),
							uploadState: "error",
							uploadTask: null
						});
					},
					() => {
						this.state.uploadTask.snapshot.ref
							.getDownloadURL()
							.then(downloadUrl => {
								this.sendFileMessage(downloadUrl, ref, pathToUpload);
							})
							.catch(err => {
								console.error(err);
								this.setState({
									errors: this.state.errors.concat(err),
									uploadState: "error",
									uploadTask: null
								});
							});
					}
				);
			}
		);
	};

	openToast = () => {
		this.setState({ openToast: false });
		return setTimeout(() => {
			toast({
				type: "info",
				icon: "check",
				title: "File Uploaded",
				description: "your request success",
				animation: "fadeIn",
				time: 3000
			});
		}, 0);
	};

	sendFileMessage = (fileUrl, ref, pathToUpload) => {
		ref
			.child(pathToUpload)
			.push()
			.set(this.createMessage(fileUrl))
			.then(() => {
				this.setState({ uploadState: "done" });
			})
			.catch(err => {
				console.error(err);
				this.setState({
					errors: this.state.errors.concat(err)
				});
			});
	};
	render() {
		const {
			errors,
			loading,
			message,
			modal,
			percentUploaded,
			uploadState,
			emojiPicker
		} = this.state;
		return (
			<Segment className="message__form">
				{emojiPicker && (
					<Picker
						set="apple"
						onSelect={this.handleAddEmoji}
						className="emojipicker"
						title="Pick your emoji"
						emoji="point_up"
					/>
				)}
				<Input
					fluid
					name="message"
					style={{ marginBottom: "0.7em" }}
					label={
						<Button
							icon={emojiPicker ? "close" : "add"}
							content={emojiPicker ? "Close" : null}
							onClick={this.handleTogglePicker}
						/>
					}
					labelPosition="left"
					onKeyDown={this.handleKeyDown}
					onChange={this.handleChange}
					value={message}
					ref={node => (this.messageInputRef = node)}
					loading={loading}
					className={
						errors.some(error => error.message.includes("message"))
							? "error"
							: ""
					}
					placeholder="write your Message"
				/>
				<Button.Group icon widths="2">
					<Button
						disabled={loading}
						color="orange"
						content="Add Reply"
						labelPosition="left"
						icon="edit"
						onClick={this.sendMessage}
					/>
					<Button
						color="teal"
						disabled={uploadState === "uploading"}
						content="UploadMedia"
						labelPosition="right"
						icon="cloud upload"
						onClick={this.openModal}
					/>
					{/* <Button
						color="teal"
						disabled={uploadState === "uploading"}
						content="UploadMedia"
						labelPosition="right"
						icon="cloud upload"
						onClick={this.openToast}
					/> */}
				</Button.Group>
				<FileModal
					modal={modal}
					closeModal={this.closeModal}
					uploadFile={this.uploadFile}
				/>

				<SemanticToastContainer className="toast" />

				<ProgressBar
					uploadState={uploadState}
					percentUploaded={percentUploaded}
				/>
			</Segment>
		);
	}
}

export default MessageForm;
