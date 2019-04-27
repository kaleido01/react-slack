import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";

import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import MetaPanel from "./Metapanel/MetaPanel";
import Messages from "./Message/Messages";
import Navbar from "./../Navbar/Navbar";

const App = ({
	currentUser,
	currentChannel,
	isPrivateChannel,
	userPosts,
	primaryColor,
	secondaryColor
}) => {
	return (
		<React.Fragment>
			<Navbar />

			<Grid
				columns="equal"
				className="app"
				style={{ background: secondaryColor }}>
				<ColorPanel
					currentUser={currentUser}
					key={currentUser && currentUser.name}
				/>
				<SidePanel
					currentUser={currentUser}
					key={currentUser && currentUser.uid}
					primaryColor={primaryColor}
				/>
				<Grid.Column style={{ marginLeft: 320 }}>
					<Messages
						currentChannel={currentChannel}
						key={currentChannel && currentChannel.id}
						currentUser={currentUser}
						isPrivateChannel={isPrivateChannel}
					/>
				</Grid.Column>
				<Grid.Column width={4}>
					<MetaPanel
						key={currentChannel && currentChannel.name}
						isPrivateChannel={isPrivateChannel}
						currentChannel={currentChannel}
						userPosts={userPosts}
					/>
				</Grid.Column>
			</Grid>
		</React.Fragment>
	);
};

const mapStateToProps = state => ({
	currentUser: state.user.currentUser,
	currentChannel: state.channel.currentChannel,
	isPrivateChannel: state.channel.isPrivateChannel,
	userPosts: state.channel.userPosts,
	primaryColor: state.colors.primaryColor,
	secondaryColor: state.colors.secondaryColor
});

export default connect(mapStateToProps)(App);
