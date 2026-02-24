import React, { CSSProperties } from 'react';

import './FilePicker.css';
import { FCMCore } from 'fcmlib/lib/FCMCore';
import { FlowDisplayColumn } from 'fcmlib/lib/FlowDisplayColumn';
import { FlowObjectData } from 'fcmlib/lib/FlowObjectData';
import { FCMModal } from 'fcmkit/lib/ModalDialog/FCMModal';
import { eContentType } from 'fcmlib/lib/FCMNew';
import { FCMModalButton } from 'fcmkit/lib/ModalDialog/FCMModalButton';
import { FlowObjectDataProperty } from 'fcmlib/lib/FlowObjectDataProperty';

export class _FilePicker extends React.Component<any,any> {

    version: string = '1.0.0';
    component: FCMCore;
    selectedItem: string = null;
    imgDiv: any;
    img: any;
    text: string = '';
    fileInput: HTMLInputElement;
    mode: string;
    fileTypes: string[];

    messageBox: FCMModal;
    suppress: boolean = false;

    lastContent: any = (<div></div>);

    constructor(props: any) {
        super(props);
        this.component = this.props.parent;
        this.fileSelected = this.fileSelected.bind(this);
        this.fileReadAsDataURL = this.fileReadAsDataURL.bind(this);
        this.ResizeBase64Img = this.ResizeBase64Img.bind(this);
        this.clearFile = this.clearFile.bind(this);
        this.pickFile = this.pickFile.bind(this);
        this.chooseFile = this.chooseFile.bind(this);
        this.isImage = this.isImage.bind(this);
        this.rescaleImage = this.rescaleImage.bind(this);
        this.chooseFile = this.chooseFile.bind(this);

        this.iconRender = this.iconRender.bind(this);
        this.prep = this.prep.bind(this);

        this.mode = this.component.getAttribute("mode", "default");
        this.fileTypes = this.component.getAttribute("allowed","*").split(",") || ["*"];

        this.state={
            imgData: undefined,
            file: undefined,
        }

        this.prep();
    }

    async prep() {
        this.img = this.component.getAttribute("icon");
        this.img = await this.component.inflateValue(this.img);
        this.forceUpdate();
    }

    async componentDidMount() {
        if(this.suppress){
            this.suppress=false;
        }
        else {
            await this.clearFile(true);
            this.forceUpdate();
        }
    }

    rescaleImage(e: any) {
        const width: number = this.img.width;
        const height: number = this.img.height;

        // need to check on IE compatibility here - i think aspect ration is wrong in IE
        if (width >= height) {
             this.img.style.width = '100%';
             this.img.style.height = 'auto';
            // this.imgDiv.style.flexDirection = 'column';
        } else {
             this.img.style.width = 'auto';
             this.img.style.height = '100%';
            // this.imgDiv.style.flexDirection = 'row';
        }
    }

    async componentUpdated(changeDetected: boolean) {
    }


    async clearFile(notify: boolean = true) {
        console.log("clear file");
        this.suppress = true;
        this.setState({
            imgData: undefined,
            file: undefined,
        });

        let newState : any = {};
        if (this.component.contentType === eContentType.ContentString) {
            this.component.setStateValue("");
        }
        else {
            let objData: FlowObjectData= this.component.objectData.items[0];
                            
            if(objData) {
                objData.properties[this.component.getAttribute("fileNameField")].value = "";
                objData.properties[this.component.getAttribute("extensionField")].value = "";
                objData.properties[this.component.getAttribute("mimeTypeField")].value = "";
                objData.properties[this.component.getAttribute("sizeField")].value = "";
                objData.properties[this.component.getAttribute("dataField")].value = "";
                objData.isSelected=false;
            }
            this.component.setStateValue(objData);
        }
        if (this.component.getAttribute("onCleared","").length > 0 && this.component.outcomes[this.component.getAttribute("onCleared")]) {
            this.component.triggerOutcome(this.component.getAttribute("onCleared"));
        }        
    }

    pickFile() {
        this.fileInput.value = '';
        this.fileInput.click();
    }

    isImage(mimeType: string): boolean {
        switch (mimeType) {
            case 'image/jpg':
            case 'image/jpeg':
            case 'image/bmp':
            case 'image/gif':
            case 'image/giff':
            case 'image/png':
            case 'image/webp':
                return true;

            default:
                return false;
        }
    }

    async chooseFile(e: any) {
        
        let pickerOpts: any = {
            types: [],
            excludeAcceptAllOption: true,
            multiple: false,
        };

        let attr: string = this.component.getAttribute("allowedExtensions", "*");
        let types: string[] = attr.split(",");
        let imgAdded: boolean = false;
        
        
        try{
            if((window as any).showOpenFilePicker){ //supported?
                types.forEach((type: string) => {
                    type=type.trim().toLowerCase();
                    switch(type){
                        case "*":
                            pickerOpts.excludeAcceptAllOption = false;
                            break;
                        case "zip":
                            pickerOpts.types.push(
                            {
                                description: 'ZIP Files',
                                accept: {
                                    'application/zip': ['.zip'],
                                },
                                },
                            );
                            break;
                        case "csv":
                            pickerOpts.types.push(
                            {
                                description: 'CSV Files',
                                accept: {
                                    'text/csv': ['.csv'],
                                },
                                },
                            );
                            break;
                        case "xlsx":
                            pickerOpts.types.push(
                            {
                                description: 'Excel Files',
                                accept: {
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsz'],
                                },
                                },
                            );
                            break;
                        case "xml":
                            pickerOpts.types.push(
                            {
                                description: 'XML Files',
                                accept: {
                                    'application/xhtml+xml': ['.xml'],
                                },
                                },
                            );
                            break;
                        case "pdf":
                            pickerOpts.types.push(
                            {
                                description: 'PDF Files',
                                accept: {
                                    'application/pdf': ['.pdf'],
                                },
                                },
                            );
                            break;
                        case "png":
                        case "jpg":
                        case "gif":
                        case "jpeg":
                            if(imgAdded===false){
                                pickerOpts.types.push(
                                {
                                    description: 'Image Files',
                                    accept: {
                                        'image/*': ['.png','.gif','.jpeg','.jpg'],
                                    },
                                    },
                                );
                                imgAdded=true;
                            }
                            break;
                    }
                });
                let handle: any[] = await (window as any).showOpenFilePicker(pickerOpts);
                if(handle[0].kind === 'file') {
                    let file = await handle[0].getFile();
                    let data = await this.fileReadAsDataURL(file);
                    this.setState({file: file, imageData: data},this.fileChosen);
                }
            }
            else {
                //this.pickFile();
                if(!this.fileInput) {
                    this.fileInput = document.createElement("input");
                    this.fileInput.type = "file";
                    this.fileInput.style.width="0";
                    this.fileInput.style.height="0";
                    
                    if(this.component.getAttribute("filterPicker","true")==="true"){
                        if(types.indexOf("*") < 0) {
                            let typeStr: string = "";
                            types.forEach((type: string)=>{
                                if(typeStr.length > 0) {
                                    typeStr += ","
                                }
                                typeStr += "." + type.trim();
                            });
                            //this.fileInput.accept=typeStr
                        }
                    }
                    this.fileInput.addEventListener("change",this.fileSelected);
                    //this.fileInput.addEventListener("click",this.fileSelected);

                    let comp: any = document.getElementById(this.component.props.id);
                    comp.appendChild(this.fileInput);
                }
                this.fileInput.value = '';
                this.fileInput.click(); 
            }
        }
        catch(e) {
            console.log(e);
        }
        finally{
            console.log("done");
            //await this.fileChosen();
        }
    }

    async fileChosen() {
        if (this.state.file?.name?.length > 0) {
         
            const fname: string = this.state.file.name.lastIndexOf('.') >= 0 ? this.state.file.name.substring(0, this.state.file.name.lastIndexOf('.')) : this.state.file.name;
            const ext: string = this.state.file.name.lastIndexOf('.') >= 0 ? this.state.file.name.substring(this.state.file.name.lastIndexOf('.') + 1).toLowerCase() : '';
            const typ: string = this.state.file.type;
            const size: number = this.state.file.size;
            let dataURL: string = this.state.imageData;

            let maxSize: number = parseInt(this.component.getAttribute("maxSizeKB","0"));
            if(maxSize>0 && size>(maxSize * 1000)){
                let maxMB: number = maxSize/1000;
                let actMB: number = size/1000/1000;
                let msg: string = this.component.getAttribute("oversizeMessage",
                "The file you have chosen is larger than the maximum allowd $2 MB");
                msg = await this.component.inflateValue(msg);
                msg = msg.replace("$1",actMB.toString());
                msg = msg.replace("$2",maxMB.toString());
                this.messageBox.showDialog(
                    null,
                    "File Too Large",
                    (<span>{msg}</span>),
                    [new FCMModalButton("Ok",this.messageBox.hideDialog)]
                );
            }
            else {

                if (this.isImage(typ)) {
                    let imgSize: number = 0;
                    if (parseInt(this.component.getAttribute('imageSize','0')) > 0) {
                        imgSize = parseInt(this.component.getAttribute('imageSize'));
                    }
                    if(imgSize > 0) {
                        dataURL = await this.ResizeBase64Img(dataURL, imgSize);
                    }
                    
                }

                let newState : any = {};
                if (this.component.contentType === eContentType.ContentString) {
                    this.component.setStateValue(dataURL);
                }
                else {
                    //let objData: FlowObjectData = this.component.objectData.items[0];
                    let objData: FlowObjectData = FlowObjectData.newInstance(this.component.objectData.items[0].developerName);
                    if(objData) {
                        if(this.component.getAttribute("fileNameField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("fileNameField"),
                                eContentType.ContentString,
                                fname
                            ));
                        }
                        if(this.component.getAttribute("extensionField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("extensionField"),
                                eContentType.ContentString,
                                ext
                            ));
                        }
                        if(this.component.getAttribute("mimeTypeField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("mimeTypeField"),
                                eContentType.ContentString,
                                typ
                            ));
                        }
                        if(this.component.getAttribute("sizeField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("sizeField"),
                                eContentType.ContentNumber,
                                size
                            ));
                        }
                        if(this.component.getAttribute("dataField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("dataField"),
                                eContentType.ContentString,
                                dataURL
                            ));
                        }                     
                    }
                    objData.isSelected=true;
                    this.suppress=true;
                    this.component.setStateValue(objData);
                }
                this.forceUpdate();
                if (this.component.getAttribute("onSelected","").length > 0 && this.component.outcomes[this.component.getAttribute("onSelected")]) {
                    this.component.triggerOutcome(this.component.getAttribute("onSelected"));
                }  
            }
        }
    }

    
    async fileSelected(e: any) {

        //if(e.type === "click"){
        //    return
        //}

        let attr: string = this.component.getAttribute("allowedExtensions", "*");
        let types: string[] = attr.split(",");
        let opts: string[] = [];
        types.forEach((type: string)=>{
            opts.push(type.trim().replace(".",""));
        });

        if (this.fileInput.value.length > 0) {
            const file: File = this.fileInput.files[0];
            //let comp: any = document.getElementById(this.component.props.id);
            //comp.removeChild(this.fileInput);
            let dataURL: string = await this.fileReadAsDataURL(file);
            const fname: string = file.name.lastIndexOf('.') >= 0 ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
            const ext: string = file.name.lastIndexOf('.') >= 0 ? file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase() : '';
            const typ: string = file.type;
            const size: number = file.size;

            // check file size
            let maxSize: number = parseInt(this.component.getAttribute("maxSizeKB","0"));
            if(maxSize>0 && size>(maxSize * 1000)){
                this.messageBox.showDialog(
                    null,
                    "File Too Large",
                    (<span>The file you have chosen is { size } bytes long and exceeds the maximum file size of { maxSize }</span>),
                    [new FCMModalButton("Ok",this.messageBox.hideDialog)]
                );
            }
            else if(opts.length > 0 && opts.indexOf("*") < 0 && opts.indexOf(ext) < 0){// check allowed types
                this.messageBox.showDialog(
                    null,
                    "Wrong File Type",
                    (<span>The file you have chosen is not of the permitted type(s)</span>),
                    [new FCMModalButton("Ok",this.messageBox.hideDialog)]
                );
            }
            else{
                if (this.isImage(typ)) {
                    let imgSize: number = 0;
                    if(parseInt(this.component.getAttribute("imageSize","0")) > 0) {
                        dataURL = await this.ResizeBase64Img(dataURL, parseInt(this.component.getAttribute("imageSize","0")));
                    }
                    
                }

                let newState : any = {};
                if (this.component.contentType === eContentType.ContentString) {
                    this.component.setStateValue(dataURL);
                }
                else {
                    
                    let objData: FlowObjectData = FlowObjectData.newInstance(this.component.objectData.items[0].developerName);
                    
                    
                    if(objData) {
                        if(this.component.getAttribute("fileNameField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("fileNameField"),
                                eContentType.ContentString,
                                fname
                            ));
                        }
                        if(this.component.getAttribute("extensionField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("extensionField"),
                                eContentType.ContentString,
                                ext
                            ));
                        }
                        if(this.component.getAttribute("mimeTypeField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("mimeTypeField"),
                                eContentType.ContentString,
                                typ
                            ));
                        }
                        if(this.component.getAttribute("sizeField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("sizeField"),
                                eContentType.ContentNumber,
                                size
                            ));
                        }
                        if(this.component.getAttribute("dataField")){
                            objData.addProperty(FlowObjectDataProperty.newInstance(
                                this.component.getAttribute("dataField"),
                                eContentType.ContentString,
                                dataURL
                            ));
                        }                     
                    }
                    objData.isSelected=true;
                    this.component.setStateValue(objData);
                }
                if (this.component.getAttribute("onSelected","").length > 0 && this.component.outcomes[this.component.getAttribute("onSelected")]) {
                    this.component.triggerOutcome(this.component.getAttribute("onSelected"));
                } 
            }
        }
        
        // remove input
        //let comp: any = document.getElementById(this.component.props.id);
        //comp.removeChild(this.fileInput);
        this.clearFile(true);
        
    }

    async fileReadAsDataURL(file: any): Promise<any> {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new DOMException('Problem reading file'));
            };
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsDataURL(file);
        });
    }

    async fileReadAsArrayBuffer(file: any): Promise<any> {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new DOMException('Problem reading file'));
            };
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    async ResizeBase64Img(base64: string, width: number): Promise<any> {

        const img = new Image();
        return new Promise((resolve, reject) => {
            img.onload = () => {
                const aspectRatio = img.height / img.width;
                const canvas = document.createElement('canvas');

                canvas.width = width;
                canvas.height = width * aspectRatio;

                const context = canvas.getContext('2d');

                const reductionFactor = width / img.width;
                context.scale(canvas.width / img.width , canvas.height / img.height);

                context.drawImage(img, 0 , 0);
                const resized = canvas.toDataURL();
                resolve(resized);
            };
            img.onerror = () => {
                reject(new DOMException('Problem loading image file'));
            };
            img.src = base64;
        });
    }

    
    render() {
        switch(this.mode) {
            
            case "basic":
                return this.basicRender();
            case "icon":
                return this.iconRender();
            default:
                return this.defaultRender();
        }
    }

    iconRender() {
        let classes: string = 'file-picker ' + this.component.getAttribute('classes', '');
        const style: CSSProperties = {};
        style.width = 'fit-content';
        style.height = 'fit-content';

        if (this.component.isVisible === false) {
            style.display = 'none';
        }
        if (this.component.getAttribute("width")) {
            style.width = this.component.getAttribute("width");
        }
        if (this.component.getAttribute("height")) {
            style.height = this.component.getAttribute("height");
        }

        const title: string = this.component.label || '';

        let icon = this.component.getAttribute("icon","open");
        let iconClass: string = "file-picker-icon glyphicon glyphicon-" + icon;
        if(this.component.getAttribute("transparent","false") === "true"){
            classes += " file-picker-transparent";
        }
        
        //let iconStyle: CSSProperties = {};
        //iconStyle.fontSize = (style.width / 20) + "rem"

        return (
            <div
                style={style}
                className={classes}
                id={this.component.props.id}
            >
                <FCMModal
                    ref={(element: FCMModal) => {this.messageBox = element}}
                />
                <img
                    onClick={
                        this.chooseFile
                        //this.pickFile
                    }
                    className={iconClass}
                    //style={iconStyle}
                    title="Select a file"
                    src={this.img}
                    alt="No Image Defined"
                />
            </div>
        );
    }

    basicRender() {
        let allowed: string = "";
        this.fileTypes.forEach((type: string) => {
            if(allowed.length>0){
                allowed += ","
            }
            if(!type.startsWith(".")) {
                allowed+=".";
            }
            allowed+=type;
        });

        let classes: string = ' ' + this.component.getAttribute('classes', '');
        const style: CSSProperties = {};
        style.width = 'fit-content';
        style.height = 'fit-content';

        if (this.component.isVisible === false) {
            style.display = 'none';
        }
        if (this.component.getAttribute("width")) {
            style.width = this.component.getAttribute("width");
        }
        if (this.component.getAttribute("height")) {
            style.height = this.component.getAttribute("height");
        }

        const title: string = this.component.label || '';

        let clearButton: any;
        if(this.state.file) {
            clearButton = (
                <span
                    className="glyphicon glyphicon-remove-circle file-picker-clear"
                    onClick={(e: any) => {this.clearFile(true)}}
                    title="Clear file selection"
                />
            );
        }

        return (
            <div
                className={classes}
                style={style}
                id={this.component.props.id}
            >
                <FCMModal
                    ref={(element: FCMModal) => {this.messageBox = element}}
                />
                <div
                    style={{marginBottom: "0.5rem"}}
                >
                    {title}
                </div>
                <div>
                    <span
                        onClick={this.chooseFile}
                        className="file-picker-button"
                    >
                        Choose file
                    </span>
                    <span
                        className="file-picker-filename"
                    >
                        {this.state.file?.name}
                    </span>
                    {clearButton}
                </div>
            </div>
        );
    }

    dataURItoBlob(dataURI: string) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        var ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ab], {type: mimeString});
        var fileUrl = URL.createObjectURL(blob);
        return fileUrl;

    }

    defaultRender() {
        
        let componentClass: string = this.component.getAttribute('classes', '');
        const style: CSSProperties = {};
        style.width = 'auto';
        style.height = 'auto';

        if (this.component.isVisible === false) {
            style.display = 'none';
        }
        if (this.component.getAttribute("width")) {
            style.width = this.component.getAttribute("width");
            style.minHeight = style.width;
        }
        if (this.component.getAttribute("height")) {
            style.height = this.component.getAttribute("height");
        }

        let title: string = this.component.label || 'Select File';

        let headerClass: string = "";
       

        if(this.component.getAttribute("transparent","false") === "true"){
            componentClass += " file-picker-transparent";
            headerClass = "file-picker-header-transparent ";
            title="";
        }
        else {
            componentClass += " file-picker";
            headerClass = "file-picker-header ";
        }
        
        let filePick: any;
        
        
        let clearButton: any;
        //filePick = this.pickFile;
        filePick = this.chooseFile;
        clearButton = (
            <span 
                className="glyphicon glyphicon-remove file-picker-header-button" 
                onClick={(e: any) => {this.clearFile(true)}}
                title="Clear selected file"
            />
        );
        

        let file: any;
        let mimeType: string;
        let fileContent: string;
        let fileName: string;
        let extension: string;
        let content: any;

        
        if(this.component.contentType === eContentType.ContentString) {
            fileContent=this.component.contentValue;
        }
        else {
            fileContent = this.state.imageData;//this.component.stateValue as FlowObjectData;//.objectData.items[0];
            fileName = this.state.file?.name;
        }
        
        //file = this.getStateValue() as FlowObjectData;

        if (fileContent) {
            mimeType = fileContent.substring(fileContent.indexOf(':') + 1, fileContent.indexOf(';'));
                
            if (this.isImage(mimeType)) {
                content = (
                    <img
                        style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            width: 'auto',
                            OObjectFit: 'cover',
                        }}
                        ref={(element: HTMLImageElement) => {this.img = element; }}
                        className="file-picker-image"
                        src={fileContent}
                        onLoad={
                            this.rescaleImage
                        }
                    />
                );
            } 
            else if(mimeType==="application/pdf") {
                let fileUrl = this.dataURItoBlob(fileContent)
                content = (
                    <iframe style={{width: "100%"}} src={fileUrl}/>
                );
            }
            else {
                content = (
                    <span
                        className="file-picker-file-name"
                    >
                        {fileName}
                    </span>
                );
            }
        }
        else {
            content = (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1
                    }}
                >
                    <div
                        style={{
                            margin: "auto",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <span
                            className="file-picker-file-name"
                            style={{margin: "auto"}}
                        >
                            {"No file selected"}
                        </span>
                        <span
                            className="file-picker-file-name"
                            style={{margin: "auto"}}
                        >
                            {"Click to select a file"}
                        </span>
                    </div>
                </div>
            );
        }

        

        this.lastContent = (
                <div 
                    className={componentClass}
                    style={style}
                >
                    <FCMModal
                        ref={(element: FCMModal) => {this.messageBox = element}}
                    />
                    <div className={headerClass}>
                        <div className="file-picker-header-left">
                            <span className="file-picker-header-title">{title}</span>
                        </div>
                        <div className="file-picker-header-right">
                            {clearButton}
                        </div>

                    </div>
                    <div
                        className="file-picker-body"
                        onClick={filePick}
                        ref={(element: any) => {this.imgDiv = element; }}
                    >
                        {content}
                        <input
                            ref={(ele: any) => {this.fileInput = ele; }}
                            type="file"
                            className="file-file"
                            onChange={this.fileSelected}
                        />
                    </div>
               </div>
        );
        return this.lastContent;
    }

}

