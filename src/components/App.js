import React from "react";
import { Grid } from "semantic-ui-react";
import "./App.css";
import { connect } from "react-redux";

import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import MetaPanel from "./Metapanel/MetaPanel";
import Message from "./Message/Message";

const App = ({ currentUser }) => {
	return (
		<Grid columns="equal" className="app" style={{ background: "#eee" }}>
			<ColorPanel />
			<SidePanel currentUser={currentUser} />
			<Grid.Column style={{ marginLeft: 320 }}>
				<Message />
			</Grid.Column>
			<Grid.Column width={4}>
				<MetaPanel />
			</Grid.Column>
		</Grid>
	);
};

const mapStateToProps = state => ({
	user: state.user.currentUser
});

export default connect(mapStateToProps)(App);
