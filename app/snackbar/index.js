import React from "react";
import style from './snackbar.css'

export default class Snackbar extends React.Component {
    render() {
        return (
            <div className="snackbar">
                <div className="snackbar-content">
                    {this.props.message}
                </div>
                {
                    this.props.actionComponent ? (
                        <div className="snackbar-action" onClick={this.props.onClick}>
                            {this.props.actionComponent}
                        </div>
                    ) : (
                            null
                    )
                }
            </div>
        );
    }
}