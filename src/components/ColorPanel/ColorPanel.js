import React from "react";
import { connect } from "react-redux";
import {
	Sidebar,
	Menu,
	Divider,
	Button,
	Icon,
	Modal,
	Label
} from "semantic-ui-react";

import { SwatchesPicker } from "react-color";
import firebase from "./../../firebase";
import { setColors } from "../../actions/index";

class ColorPanel extends React.Component {
	state = {
		modal: false,
		user: this.props.currentUser,
		primary: "",
		secondary: "",
		usersRef: firebase.database().ref("users"),
		userColors: []
	};

	componentDidMount() {
		if (this.state.user) {
			this.addListener(this.state.user.uid);
		}
	}

	addListener = userId => {
		let userColors = [];
		this.state.usersRef.child(`${userId}/colors`).on("child_added", snap => {
			userColors.unshift(snap.val());
			this.setState({ userColors });
		});
	};

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	handleChangePrimary = color => {
		this.setState({ primary: color.hex });
	};
	handleChangeSecondary = color => {
		this.setState({ secondary: color.hex });
	};

	handleSaveColors = () => {
		if (this.state.primary && this.state.secondary) {
			this.saveColors(this.state.primary, this.state.secondary);
		}
	};

	saveColors = (primary, secondary) => {
		this.state.usersRef
			.child(`${this.state.user.uid}/colors`)
			.push()
			.update({
				primary,
				secondary
			})
			.then(() => {
				this.closeModal();
			})
			.catch(err => {
				console.error(err);
			});
	};

	displayUserColors = colors =>
		colors.length > 0 &&
		colors.map((color, i) => (
			<React.Fragment key={i}>
				<Divider />
				<div
					className="color__container"
					onClick={() => this.props.setColors(color.primary, color.secondary)}>
					<div className="color__square" style={{ background: color.primary }}>
						<div
							className="color__overlay"
							style={{ background: color.secondary }}
						/>
					</div>
				</div>
			</React.Fragment>
		));

	render() {
		const { modal, userColors } = this.state;

		return (
			<Sidebar
				as={Menu}
				icon="labeled"
				inverted
				vertical
				visible
				width="very thin">
				<Divider />
				<Button icon="add" size="small" color="blue" onClick={this.openModal} />
				{this.displayUserColors(userColors)}

				{/* color picker modal */}
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>Choose App Colors</Modal.Header>

					<Modal.Content>
						<Label content="Primary Color" style={{ margin: "1em" }} />
						<span>
							<SwatchesPicker
								onChangeComplete={this.handleChangePrimary}
								height={100}
							/>
							{/* <Button color={`"${this.state.primary}"`} inverted>
								you picked{" "}
							</Button> */}
						</span>

						<Label
							content="Secondary Color"
							style={{ margin: "1em" }}
							height="100"
						/>
						<SwatchesPicker
							onChangeComplete={this.handleChangeSecondary}
							height={100}
						/>
					</Modal.Content>
					<Modal.Actions>
						<Button color="green" inverted onClick={this.handleSaveColors}>
							<Icon name="check mark" /> Save Colors
						</Button>
						<Button color="red" inverted onClick={this.closeModal}>
							<Icon name="remove" /> Cancel
						</Button>
					</Modal.Actions>
				</Modal>
			</Sidebar>
		);
	}
}

export default connect(
	null,
	{ setColors }
)(ColorPanel);
