import { FCMNew } from "fcmlib/lib/FCMNew";
import * as React from 'react';
import { _FilePicker } from "./FilePicker";

export default class FilePicker extends FCMNew {

    //FCMCore will trigger this if we should update
    componentDidMount(): void {
        this.forceUpdate();
    }

    render() {
        return(
            <_FilePicker 
                parent={this}
                ref={(element: any) => {this.childComponent = element}} // here we are giving FCMCore a ref to our component
            />
        );
    }
}