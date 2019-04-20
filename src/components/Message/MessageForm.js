import React from "react";
import uuidv4 from "uuid/v4";
import { Segment, Input, Button, Modal } from "semantic-ui-react";
import firebase from "./../../firebase";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";
class MessageForm extends React.Component {
	state = {
		storageRef: firebase.storage().ref(),
		uploadTask: null,
		uploadState: "",
		percentUploaded: 0,
		message: "",
		loading: false,
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		errors: [],
		modal: false
	};

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value });
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
		const { messagesRef } = this.props;
		const { message, channel } = this.state;

		if (message) {
			this.setState({ loading: true });
			messagesRef
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: "", errors: [] });
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

	uploadFile = (file, metadata) => {
		const pathToUpload = this.state.channel.id;
		const ref = this.props.messagesRef;
		const filePath = `chat/public/${uuidv4()}.jpg`;

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
			uploadState
		} = this.state;
		return (
			<Segment className="message__form">
				<Input
					fluid
					name="message"
					style={{ marginBottom: "0.7em" }}
					label={<Button icon="add" />}
					labelPosition="left"
					onChange={this.handleChange}
					value={message}
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
				</Button.Group>
				<FileModal
					modal={modal}
					closeModal={this.closeModal}
					uploadFile={this.uploadFile}
				/>
				<ProgressBar
					uploadState={uploadState}
					percentUploaded={percentUploaded}
				/>
			</Segment>
		);
	}
}

export default MessageForm;
