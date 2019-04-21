import React from "react";
import { Segment, Header, Icon, Input } from "semantic-ui-react";

class MessagesHeader extends React.Component {
	render() {
		const {
			channelName,
			numUniqueUsers,
			handleSearchChange,
			searchLoading,
			isPrivateChannel,
			handleStar,
			isChannelStarred
		} = this.props;
		return (
			<Segment clearing>
				{/* Channel Title */}
				<Header fluid="true" as="h2" floated="left" style={{ marginButtom: 0 }}>
					<span>
						{channelName}
						{!isPrivateChannel && (
							<Icon
								name={isChannelStarred ? "star" : "star outline"}
								color={isChannelStarred ? "yellow" : "black"}
								onClick={handleStar}
							/>
						)}
					</span>
					<Header.Subheader>{numUniqueUsers}</Header.Subheader>
					{/* Channel Search Input */}
				</Header>
				<Header floated="right">
					<Input
						onChange={handleSearchChange}
						size="mini"
						icon="search"
						name="searchTerm"
						placeholders="Search Message"
						loading={searchLoading}
					/>
				</Header>
			</Segment>
		);
	}
}

export default MessagesHeader;
