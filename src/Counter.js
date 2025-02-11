import React from "react";

class Counter extends React.Component {
	constructor(props) {
		super(props);

		this.state = { count: 5 };

		// When we don't use arrow functions declaring class methods
		// we need to bind the "this" keyword to the event handle fn
		this.handleDecrement = this.handleDecrement.bind(this);
		this.handleIncrement = this.handleIncrement.bind(this);
	}

	handleDecrement() {
		this.setState((currentState) => {
			return { count: currentState.count - 1 };
		});
	}

	handleIncrement() {
		this.setState((currentState) => {
			return { count: currentState.count + 1 };
		});
	}

	render() {
		const date = new Date("september 7 2029");
		date.setDate(date.getDate() + this.state.count);

		return (
			<div>
				<button onClick={this.handleDecrement}>&nbsp;-&nbsp;</button>
				&nbsp;
				<span>
					{date.toDateString()} [{this.state.count}]
				</span>
				&nbsp;
				<button onClick={this.handleIncrement}>&nbsp;+&nbsp;</button>
			</div>
		);
	}
}

export default Counter;
