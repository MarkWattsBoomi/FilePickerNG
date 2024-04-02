import { FCMLegacy } from "fcmlib/lib/FCMLegacy";
import * as React from 'react';
import { _FilePicker } from "./FilePicker";
declare const manywho: any;

class FilePicker extends FCMLegacy {

    //FCMCore will trigger this if we should update
    componentDidMount() {
        if(this.childComponent && this.childComponent.componentDidMount){
            this.childComponent.componentDidMount();
        }
    }

    componentUpdated(changeDetected: boolean){
        if(this.childComponent && this.childComponent.componentUpdated){
            this.childComponent.componentUpdated();
        }
    }

    render() {
        return(
            <_FilePicker 
                key={this.id}
                parent={this}
                ref={(element: any) => {this.childComponent = element}} // here we are giving FCMCore a ref to our component
            />
        );
    }
}
manywho.component.register('FilePicker', FilePicker);