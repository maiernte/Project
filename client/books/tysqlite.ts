/// <reference path="../../typings/global.d.ts" />

import {LocalRecords, LocalBooks} from 'collections/books'
import {TYLunar} from '../../lib/lunar/tylunar'

declare var SQL;
declare var Promise;
declare var Meteor;

export class TYSqlite{
    private db
    private booktype = '无效文件'
    private valid = false
    private bookname = ''
    private author = ''
    private created: Date
    private bookid = null
    private description = ''

    constructor(data){
        try{
            let buffer = this.convertDataURIToBinary(data)
            this.db =  new SQL.Database(buffer);
            this.parseBaseInfo();
            this.valid = true
        }catch(err){
            this.valid = false
        }
    }

    get Valid(){
        return this.valid
    }

    // 'gua' / 'bazi'
    get BookType(){
        return this.booktype
    }

    get Bookid(){
        return this.bookid
    }

    Close(){
        if(this.db){
            this.db.close()
        }
    }

    Import(): any{
        let promise = new Promise((resolve, reject) => {
            this.createbook().then((bookid) => {
                this.bookid = bookid

                if(this.booktype == 'gua'){
                    this.importGua(bookid, (err) => {
                        if(err){
                            reject(err)
                        }else{
                            resolve(null)
                        }
                    })
                }else if (this.booktype == 'bazi'){
                    this.importBazi(bookid, (err) => {
                        if(err){
                            reject(err)
                        }else{
                            resolve(null)
                        }
                    })
                }else{
                    this.importMix(bookid, (err) => {
                        if(err){
                            reject(err)
                        }else{
                            resolve(null)
                        }
                    })
                }

                //....
            }).catch(err => {
                reject(err)
            })
        })

        return promise;
    }

    private convertDataURIToBinary(dataURI) {
        var BASE64_MARKER = ';base64,';

        var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        var base64 = dataURI.substring(base64Index);
        var raw = window.atob(base64);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for(let i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }

        return array;
    }

    private parseBaseInfo(){
        try{
            var contents = this.db.exec("SELECT * FROM t_fuzhu");

            for(let rd of contents[0]['values']){
                if(rd[0] == 1){
                    this.bookname = rd[1]
                }else if(rd[0] == 2){
                    this.created = new Date(Date.parse(rd[1].toString()))
                }else if(rd[0] == 3){
                    this.author = rd[1]
                }else if(rd[0] == 7){
                    this.booktype = 'mix'
                    this.booktype = rd[2].toString() == '1' ? 'gua' : this.booktype
                    this.booktype = rd[2].toString() == '2' ? 'bazi' : this.booktype
                }else if(rd[0] == 20){
                    this.description = rd[1]
                }else if(rd[0] == 21){
                    this.bookid = rd[1]
                }
            }
        }catch(err){
            console.log(err)
        }
    }

    private createbook(): any{
        let promise = new Promise((resolve, reject) => {

            let doc = {
                name: this.bookname,
                description: (this.description || ''),
                icon: null,
                author: this.author,
                owner: Meteor.userId(),
                readpermission: 0,
                writepermission: 0,
                created: this.created ? this.created.getTime() : Date.now(),
                modified: Date.now(),
                readed: Date.now(),
                cloud: false,
                deleted: false,
                public: false
            }

            if(this.bookid){
                doc['_id'] = this.bookid
            }

            LocalBooks.insert(doc, (err, id) => {
                if(id){
                    resolve(id)
                }else{
                    reject(err)
                }
            });
        })

        return promise
    }

    private parseDescription(text){
        let items = (text || '').split('\n')
        let res = items.join('</div><div>')
        return `<div>${res}</div>`
    }

    private importBazi(bookid, callback){
        let rds = this.db.exec("SELECT * FROM t_guali");
        let owner = Meteor.userId()

        let recordcount = rds[0]['values'].length
        let counter = recordcount
        for(let idx = 0; idx < recordcount; idx++){
            let rd = rds[0]['values'][idx]

            let create = new Date(Date.parse(rd[1]))
            let modify = new Date(Date.parse(rd[2]))
            let birthday = new Date(Date.parse(rd[3]))
            let name = rd[7]
            let gender = rd[8] == '男' ? 'm' : 'f'
            let description = this.parseDescription(rd[9])

            let bazi = TYLunar.calcBazi(birthday.getFullYear(),
                birthday.getMonth() + 1,
                birthday.getDate(),
                birthday.getHours(),
                birthday.getMinutes())

            let doc = {
                book: bookid,
                bazi: {
                    time: birthday.formate('datetime'),
                    gender: gender,
                    place: rd[4],
                    bazi: `${bazi.Y.Name} ${bazi.M.Name} ${bazi.D.Name} ${bazi.T.Name}`
                },
                question: name,
                description: description,
                owner: owner,
                feed: '',
                created: create.getTime(),
                modified: modify.getTime(),
                deleted: false,
                cloud:false
            }

            LocalRecords.insert(doc, (err, id) => {
                counter--
                if(counter == 0){
                    console.log('import record finished')
                    callback(null)
                }
            })
        }
    }

    private importGua(bookid, callback){
        let rds = this.db.exec("SELECT * FROM t_guali");
        let owner = Meteor.userId()

        let recordcount = rds[0]['values'].length
        let counter = recordcount
        for(let idx = 0; idx < recordcount; idx++){
            let rd = rds[0]['values'][idx]

            if(rd[7].length < 3 || rd[8].length < 3){
                counter--
                continue
            }

            let create = new Date(Date.parse(rd[1]))
            let modify = new Date(Date.parse(rd[2]))
            let time: any = new Date(Date.parse(rd[6] || ''))
            let gua = [rd[7], rd[8]]
            let question = rd[9]
            let description = this.parseDescription(rd[10])
            let yueri = [rd[4], rd[5]]

            if(time.toString() == 'Invalid Date'){
                time = null
            }else{
                time = time.formate('datetime')
            }

            let doc = {
                book: bookid,
                gua: {
                    time: time,
                    yueri: yueri,
                    ben: gua[0],
                    bian: gua[1],
                    type: '0'
                },
                question: question,
                description: description,
                owner: owner,
                feed: '',
                created: create.getTime(),
                modified: modify.getTime(),
                deleted: false,
                cloud:false
            }

            LocalRecords.insert(doc, (err, id) => {
                counter--
                if(counter == 0){
                    console.log('import record finished')
                    callback(null)
                }
            })
        }
    }

    private importMix(bookid, callback){
        let rds = this.db.exec("SELECT * FROM t_guali");
        let counter = rds[0]['values'].length

        for(let row of rds[0]['values']){
            let doc = JSON.parse(row[1])

            LocalRecords.insert(doc, (err, id)=>{
                counter--
                if(counter == 0){
                    console.log('import record finished')
                    callback(null)
                }
            })
        }
    }
}