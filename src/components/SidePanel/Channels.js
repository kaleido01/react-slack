import React from "react";
import { connect } from "react-redux";
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react";
import { setCurrentChannel } from "../../actions/index";
import firebase from "./../../firebase";

class Channels extends React.Component {
	state = {
		user: this.props.currentUser,
		channels: [],
		modal: false,
		channelName: "",
		channelDetails: "",
		channelsRef: firebase.database().ref("channels"),
		firstLoad: true,
		activeChannel: ""
	};

	componentDidMount() {
		this.addListeners();
	}

	componentWillUnmount() {
		this.removeListners();
	}

	removeListners = () => {
		this.state.channelsRef.off();
	};

	addListeners = () => {
		let loadedchannels = [];
		this.state.channelsRef.on("child_added", snap => {
			loadedchannels.push(snap.val());
			this.setState({ channels: loadedchannels }, () => this.setFirstChannel());
		});
	};

	setFirstChannel = () => {
		const firstChannel = this.state.channels[0];
		if (this.state.firstLoad && this.state.channels.length > 0) {
			this.props.setCurrentChannel(firstChannel);
			this.setActiveChannel(firstChannel);
		}
		this.setState({ firstload: false });
	};

	closeModal = () => this.setState({ modal: false });

	handleChange = event => {
		this.setState({ [event.target.name]: event.target.value });
	};

	handleSubmit = event => {
		event.preventDefault();
		if (this.isFormValid(this.state)) {
			this.addChannel();
		}
	};

	changeChannel = channel => {
		this.setActiveChannel(channel);
		this.props.setCurrentChannel(channel);
	};

	setActiveChannel = channel => {
		this.setState({ activeChannel: channel.id });
	};

	displayChannels = channels => {
		return (
			channels.length > 0 &&
			channels.map(channel => (
				<Menu.Item
					key={channel.id}
					onClick={() => this.changeChannel(channel)}
					name={channel.name}
					style={{ opacity: 0.7 }}
					active={channel.id === this.state.activeChannel}>
					#{channel.name}
				</Menu.Item>
			))
		);
	};

	isFormValid = ({ channelName, channelDetails }) => {
		return channelName && channelDetails;
	};

	addChannel = () => {
		const { channelsRef, channelName, channelDetails, user } = this.state;
		console.log(user);
		const key = channelsRef.push().key;

		const newChannel = {
			id: key,
			name: channelName,
			details: channelDetails,
			createdBy: {
				name: user.displayName,
				avatar: user.photoURL
			}
		};

		channelsRef
			.child(key)
			.update(newChannel)
			.then(() => {
				this.setState({ channelName: "", channelDetails: "" });
				this.closeModal();
			})
			.catch(err => {
				console.log(err);
			});
	};

	render() {
		const { channels, modal } = this.state;
		return (
			<React.Fragment>
				<Menu.Menu style={{ paddingBottom: "2em" }}>
					<Menu.Item>
						<span>
							<Icon name="exchange" /> CHANNELS
						</span>{" "}
						({channels.length})
						<Icon name="add" onClick={() => this.setState({ modal: true })} />
					</Menu.Item>
					{this.displayChannels(channels)}
				</Menu.Menu>
				{/* Add Channel Modal */}
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>Add a New Channel</Modal.Header>
					<Modal.Content>
						<Form onSubmit={this.handleSubmit}>
							<Form.Field>
								<Input
									fluid
									label="Name of Channel"
									name="channelName"
									onChange={this.handleChange}
								/>
							</Form.Field>
							<Form.Field>
								<Input
									fluid
									label="About the Channel"
									name="channelDetails"
									onChange={this.handleChange}
								/>
							</Form.Field>
						</Form>
					</Modal.Content>
					<Modal.Actions>
						<Button color="green" inverted onClick={this.handleSubmit}>
							<Icon name="checkmark" />
							Add
						</Button>
						<Button color="red" inverted onClick={this.closeModal}>
							<Icon name="remove" />
							Cancel
						</Button>
					</Modal.Actions>
				</Modal>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {};

export default connect(
	null,
	{ setCurrentChannel }
)(Channels);
