import React, { Component } from "react";
import { Menu } from "semantic-ui-react";

class Navbar extends Component {
	render() {
		return (
			<Menu className="mobile__nav" fixed="top">
				<Menu.Item content="aaa" />
			</Menu>
		);
	}
}

export default Navbar;
