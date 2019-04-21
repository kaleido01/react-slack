import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";

import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import MetaPanel from "./Metapanel/MetaPanel";
import Messages from "./Message/Messages";

const App = ({ currentUser, currentChannel, isPrivateChannel }) => {
	return (
		<Grid columns="equal" className="app" style={{ background: "#eee" }}>
			<ColorPanel />
			<SidePanel
				currentUser={currentUser}
				key={currentUser && currentUser.uid}
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
				<MetaPanel />
			</Grid.Column>
		</Grid>
	);
};

const mapStateToProps = state => ({
	currentUser: state.user.currentUser,
	currentChannel: state.channel.currentChannel,
	isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(App);
