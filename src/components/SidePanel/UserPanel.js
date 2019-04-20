import React from "react";
import { Grid, Header, Icon, Dropdown, Image } from "semantic-ui-react";
import { connect } from "react-redux";
import firebase from "../../firebase";

class UserPanel extends React.Component {
	state = { user: this.props.currentUser };

	dropDownOptions = () => [
		{
			key: "user",
			text: (
				<span>
					{console.log(this.state)}
					Signed in as <strong>{this.state.user.displayName}</strong>
				</span>
			),
			disabled: true
		},
		{
			key: "avatar",
			text: <span>Change Avatar</span>
		},
		{
			key: "signOut",
			text: <span onClick={this.handleSignout}>Sign Out</span>
		}
	];

	handleSignout = () => {
		firebase
			.auth()
			.signOut()
			.then(() => console.log("signed Out!"));
	};

	render() {
		const { user } = this.state;

		return (
			<Grid style={{ background: "#4c3c4c" }}>
				<Grid.Column>
					<Grid.Row style={{ padding: "1.2rem", margin: 0 }}>
						{/* AppHeader */}
						<Header inverted floated="left" as="h2">
							<Icon name="code" />
							<Header.Content>DevChat</Header.Content>
						</Header>
						{/* User DropDown */}
						<Header style={{ padding: "0.25em" }} as="h4" inverted>
							<Dropdown
								trigger={
									<span>
										<Image src={user.photoURL} spaced="right" avatar />
										{user.displayName}
									</span>
								}
								options={this.dropDownOptions()}
							/>
						</Header>
					</Grid.Row>
				</Grid.Column>
			</Grid>
		);
	}
}

const mapStateToProps = state => ({
	currentUser: state.user.currentUser
});

export default connect(mapStateToProps)(UserPanel);
