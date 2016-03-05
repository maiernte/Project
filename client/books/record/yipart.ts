/// <reference path="../../../typings/angular2-meteor.d.ts" />
/// <reference path="../../../typings/book.d.ts" />

import {Component, Inject, ContentChild, Input, ElementRef, NgZone} from 'angular2/core'
import {NgIf} from 'angular2/common'
import {Router, RouteParams} from 'angular2/router'

import {TranslatePipe} from 'client/allgemein/translatePipe'
import {GlobalSetting} from 'client/globalsetting'

import {GuaView} from 'client/liuyao/guaview'
import {BaziView} from 'client/bazi/baziview'

import {LocalRecords, LocalBooks} from 'collections/books'
import {RecordHelper} from './recordhelper'

import {TYUploader} from 'lib/qiniu/tyuploader'
import {TYEditor} from 'client/allgemein/directives/texteditor'

declare var jQuery;
declare var MediumEditor;
declare var QiniuUploader;
declare var alertify;

@Component({
    selector: "yixue-part",
    pipes:[TranslatePipe],
    templateUrl: "client/books/record/yipart.html",
    directives: [TYEditor, NgIf]
})
export class YixuePart{
    //private static qiniuUploader;
    private static baseUrl = 'http://7xqidf.com1.z0.glb.clouddn.com/'
    private static copyLink = ''

    private translator: TranslatePipe;
    private editmodel = false;
    private images: Array<string>;
    private links: Array<string>;
    private progressValue = 0
    
    private uploadErr = null
    private qiniuUploader;

    @ContentChild(GuaView) guaview: GuaView;
    @ContentChild(BaziView) baziview: BaziView;

    @Input() record: RecordHelper;

    UpLoading = false
    ButtonId = ''
    AllowQiniu = false
    PictureUrl = ''
    Morefunction = false

    Question: string
    FeedBack: string
    Description: string

    constructor(private router: Router,
                private routeParams: RouteParams,
                private rootElement: ElementRef,
                private ngZone: NgZone,
                @Inject(GlobalSetting) public glsetting:GlobalSetting) {
        this.translator = new TranslatePipe();
    }
    
    ngOnDestroy(){
        if(this.AllowQiniu && this.qiniuUploader){
            this.qiniuUploader.Destroy()
        }
        
        this.editmodel = false
    }

    get EditModel(){
        return this.editmodel;
    }

    set EditModel(value){
        this.editmodel = value;

        if(value == false){
            console.log("set description to display")
            let domDesc = jQuery(this.rootElement.nativeElement).find('.editable.description')
            //let domDesc = jQuery('.editable.description')
            domDesc.html(this.Description)
        }else{

        }
    }

    get IsGua(){
        return this.record ? this.record.IsGua : true;
    }

    get IsCloud(){
        return this.record.IsCloud
    }

    get IsCordova(){
        return this.glsetting.IsCordova
    }

    get Images(){
        if(!this.images){
            this.images = this.record.Images
        }

        return this.images
    }

    get Links(){
        if(!this.links){
            this.links = this.record.Links
        }

        return this.links
    }

    get ImageLink(){
        let link = []
        for(let img of this.Images){
            let url = YixuePart.baseUrl + img
            link.push({extr: false, url: url, key: img})
        }

        for(let l of this.Links){
            link.push({extr: true, url: l})
        }

        return link
    }

    get QuestionT(){
        return this.IsGua ? "问念: " : "命主: "
    }


    copyLink(link: string){
        YixuePart.copyLink = link
        this.glsetting.Alert('提示', '点击最上面的图片按钮, 即可将此链接复制到新的外链图片里.')
    }

    insertLink(){
        let urlinit = (YixuePart.copyLink || '')
        
        let title = this.translator.transform("外链图片", null)
        let message = this.translator.transform("请输入图片地址：", null)
        let oktext = this.translator.transform('确定', null)
        let canceltext = this.translator.transform('取消', null)
        
        alertify.prompt(title, message, urlinit, (evt, value) => {
            if(value == null || value == '') return 
            
            let found = this.links.filter(l => l == value)
            if(found.length > 0)return

            this.record.InsertLink(value)
                .then(() => {
                    this.ngZone.run(() => {
                        this.links = this.record.Links
                        console.log('insert links to record', this.Links)
                    })
                }).catch(err => {
                    this.glsetting.Alert("添加外链失败", err.toString())
                })
        }, () => {
            console.log("cancel")
        }).set('labels', {ok:oktext, cancel:canceltext});
        
        return
    }

    removeLink(link){
        if(link.extr == false){
            // 内链图片
            console.log('remove image ', link.key)
            this.record.RemoveImage(link.key)
                .then(() => {
                    this.ngZone.run(() => {
                        this.images = this.record.Images
                    })
            }).catch(err => {
                this.glsetting.Alert("删除内链失败", err.toString())
            })
        }else{
            console.log('remove link ', link)
            this.record.RemoveLink(link.url)
                .then(() => {
                    this.ngZone.run(() => {
                        this.links = this.record.Links
                    })
            }).catch(err => {
                this.glsetting.Alert("删除外链失败", err.toString())
            })
        }
    }

    showSetting(){
        if(this.guaview) this.guaview.showSetting();
        if(this.baziview) this.baziview.showSetting();
        //this.Morefunction = !this.Morefunction
        
        jQuery(this.rootElement.nativeElement)
        .find('#bookrecord-edit').transition('fade up');
    }

    showOrigPic(url){
        this.PictureUrl = url
        jQuery('.ui.modal.picture').modal('show')
    }

    goNextRecord(flag){
        let rd: YiRecord;

        let bookid = this.record.BookId
        let created = this.record.Data.created;
        if(flag < 0){
            rd = LocalRecords.findOne({book: bookid, created: {$lt: created}, deleted: false}, 
                    {sort: {created: -1}, fields: {question: 1}})
        }else{
            rd = LocalRecords.findOne({book: bookid, created: {$gt: created}, deleted: false},
                    {sort: {created: 1}, fields: {question: 1}})
        }

        if(rd){
            this.router.parent.navigate(['./BookRecord', {bid: bookid, rid: rd._id}])
        }else{
            let msg = "现在已经是" + (flag < 0 ? '第一个' : '最后一个') + '记录'
            this.glsetting.Notify(msg, 1)
        }
    }

    ngOnInit(){
        this.ButtonId = 'upbtn-' + this.glsetting.RandomStr(5)

        /*let domQuestion = jQuery(this.rootElement.nativeElement).find('.editable.question')
        domQuestion.text((this.record.Question || ''))

        let domFeed = jQuery(this.rootElement.nativeElement).find('.editable.feed')
        domFeed.text((this.record.FeedText || ''))

        let domDesc = jQuery(this.rootElement.nativeElement).find('.editable.description')
        domDesc.html((this.record.Description || ''))*/

        this.Question = (this.record.Question || '')
        this.FeedBack = (this.record.FeedText || '')
        this.Description = (this.record.Description || '')
    }

    ngAfterViewInit(){
        this.EditModel = false

        if(this.IsCordova) return
    
        let book = LocalBooks.findOne({_id: this.record.BookId})
        if(book && book.cloud == true){
            // 本地书集以及手机软件不允许用七牛
            this.initQiNiuBook();
            this.AllowQiniu = true;
        }
    }

    editorSaved(content){
        if(content){
            this.Description = content
            this.saveChanging();
        }else{
            console.log("user cancel")
            this.Question = (this.record.Question || '')
            this.FeedBack = (this.record.FeedText || '')
        }

        this.EditModel = false
    }

    syncRecord(){
        let msg = '将此单个记录的内容与云端数据同步？'
        this.glsetting.Confirm("数据同步", msg, () => {
            this.record.CloudSync().then((res) => {
                let msg = res < 0 ? "更新到本地。" : "更新到云端。"
                msg = res == 0 ? "数据已经更新过了。" :msg
                this.glsetting.Notify(msg, 1)
            }).catch(err => {
                this.glsetting.Alert("同步数据失败", err.toString())
            })
        }, null)
    }

    UploadReady() {
        this.ngZone.run(() => {
            this.UpLoading = true
        })

        if(this.qiniuUploader.Inited == false){
            this.qiniuUploader.Init().then(() => {
                console.log('init qiniu uploader', this.qiniuUploader)
            })
        }
    }

    stickContent(year){
        let mark = '#' + year
        let start = this.Description.indexOf(mark)

        if(start < 0) {
            alertify.set('notifier','position', 'top-right');
            alertify.notify('没有此流年的内容。', "warning", 3)
            return
        }

        let end = this.Description.indexOf('#', start + 1)
        end = end < 0 ? this.Description.length - 1 : end
        console.log('start', start, end)
        let dom = this.Description.substring(start, end)
        dom = `${dom}`

        alertify.set('notifier','position', 'top-right');
        alertify.notify(dom, "message", 0)
    }

    private setprogress(value){
        this.progressValue = value > 0 ? this.progressValue + value : 0

        jQuery('#progressUploadPic').progress({
            value: this.progressValue,
            total: 100
        });
    }

    private initQiNiuBook(){
        var settings = {
            bucket: 'huaheapp',
            browse_button: this.ButtonId,
            domain: 'http://7xqidf.com1.z0.glb.clouddn.com',
            max_file_size: '500kb',
            unique_names: false ,
            save_key: false,
            bindListeners: {
                'FilesAdded': (up, files) => {
                    if(this.Images.length === 3){
                        this.glsetting.Notify("非常抱歉, 由于运营成本的缘故, 每个记录最多允许三张图片. ", -1)
                        throw Error('cancel')
                    }

                    var maxfiles = 1;
                    if(up.files.length > maxfiles )
                    {
                        up.splice(maxfiles);
                        alert('每次只允许上传一个文件');
                        throw Error('cancel')
                    }

                    console.log('add image file to ', this.record.Question, this.record.Id)
                    this.setprogress(0)
                },

                'BeforeUpload': (up, file) => {
                    this.ngZone.run(() => {
                        this.UpLoading = true;
                    })
                },

                'UploadProgress': (up, file) => {
                    console.log('progress...')
                    this.setprogress(10)
                },

                'FileUploaded': (up, file, info) => {
                    let pic = JSON.parse(info)
                    this.record.InsertImage(pic.key)
                    console.log('update images of', this.record.Question, this.record.Id)
                },
                'Error': (up, err, errTip) => {
                    this.uploadErr = err
                },
                'UploadComplete': () => {
                    this.ngZone.run(() => {
                        this.UpLoading = false;
                        if(this.uploadErr){
                            this.glsetting.Alert('上传失败', this.uploadErr.toString())
                        }else {
                            console.log('upload completed', this.record.Id)
                            this.ngZone.run(() => {
                                this.UpLoading = false;
                                this.images = this.record.Images
                            })
                        }
                    })
                },
                'Key': (up, file) => {
                    // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                    // 该配置必须要在 unique_names: false , save_key: false 时才生效
                    let item = file.name.split('.')
                    let endung = item[item.length - 1]
                    let bk =this.record.BookId
                    let rd = this.record.Id
                    let name = this.glsetting.RandomStr(5)
                    let uid = Meteor.userId()

                    var key = `uid-${uid}/bk-${bk}/rd-${rd}/${name}.${endung}`
                    return key;
                }
            }
        }

        try{
            this.qiniuUploader = new TYUploader(settings)
            this.qiniuUploader.Init()
        }catch(err){
            console.log('init qiniu err:', err)
            this.qiniuUploader = null
        }
    }

    private saveChanging(){
        this.record.Save(this.Question, this.FeedBack, this.Description).then(res => {
            if(this.guaview) this.guaview.changeQuestion(this.Question);
            if(this.baziview) this.baziview.changeQuestion(this.Question);
            this.glsetting.Notify('成功更新到数据库！', 1)
        }).catch(err => {
            this.glsetting.Alert('更新数据失败', err.toString())
        });
    }
}