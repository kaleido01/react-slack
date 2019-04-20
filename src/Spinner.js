import React from "react";

import { Loader, Dimmer } from "semantic-ui-react";

import { PacmanLoader } from "react-spinners";
const Spinner = () => {
	return (
		<Dimmer active inverted>
			<Loader size="huge" content={"Preparing chat..."} />;
		</Dimmer>
	);
};

export default Spinner;
