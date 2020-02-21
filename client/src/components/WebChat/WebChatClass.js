import React, { Component } from "react";

class WebChatClass extends Component {
    constructor(props){
        super(props)

        this.localVideoref = React.createRef()
    }


    render() { return (
        <div className="WebcamBox">
            <video id="video" autoplay></video>
        </div>
    );
    }
}