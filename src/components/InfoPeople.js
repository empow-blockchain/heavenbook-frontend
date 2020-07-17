import React, { Component } from 'react'
import { connect } from 'react-redux';
import ServerAPI from '../ServerAPI'
import Alert from 'react-s-alert';
import LanguageService from '../services/LanguageService'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CONTRACT } from '../constants/index'
import Utils from '../utils'
import LoadingOverlay from 'react-loading-overlay';

class Navbar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filePhoto: [],
            activeOptionChild: false,
            post: {
                type: "post",
                name: {},
                age: {},
                preface: "",
                education: [{}],
                religion: "",
                achievements: [{}],
                reason: {},
                parents: {},
                couple: [{}],
                children: [{}]
            },
            preface: "",
            religion: "",
            isUploading: false,
            selectedRelationship: "Parents"
        }
    };

    componentDidMount() {
        var { postDetail } = this.props
        if (postDetail) {
            var post = { ...postDetail }
            post.parents = postDetail.relationship.parents
            post.couple = postDetail.relationship.couple
            post.children = postDetail.relationship.children
            post.type = "update"
            var preface = postDetail.preface
            var religion = postDetail.religion
            var fileUrl = postDetail.photos
            this.setState({
                post,
                preface,
                religion,
                fileUrl
            })
        }

    }

    upLoadPhoto = () => {
        this.refs.fileUploader.click();
    }

    uploadPhotoServer = async (file) => {
        if (this.state.typeFile === 'video/mp4' || this.state.typeFile === "image/gif") {
            return;
        }

        const data = new FormData()
        data.append('file', file)
        try {
            const url = await ServerAPI.uploadPhoto(data, "[320, 670]", true)
            var obj = {
                320: url.dataResize320,
                670: url.dataResize670
            }
            return obj
        } catch (err) {
            Alert.error(err.message ? err.message : err)
            this.resetContent()
        }
    }

    onProcessFile = async (files) => {
        var { filePhoto, fileUrl } = this.state
        var countFile = files.length
        if (filePhoto && filePhoto.length === 6) {
            return;
        }

        var lg = countFile > (6 - filePhoto.length) ? (6 - filePhoto.length) : countFile;
        if (!fileUrl) {
            fileUrl = []
        }

        this.setState({
            isUploading: true
        })

        for (let i = 0; i < lg; i++) {
            let url = URL.createObjectURL(files[i]);
            filePhoto.push(url)
            var res = await this.uploadPhotoServer(files[i])
            fileUrl.push(res)
        }
        this.setState({
            filePhoto,
            fileUrl,
            isUploading: false
        })
    }

    handleChange = (event) => {
        if (event.target.files.length > 0) {
            this.onProcessFile(event.target.files)
        }
    }

    openCity = (evt, cityName) => {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        if (document.getElementById(cityName)) {
            document.getElementById(cityName).style.display = "block";
        }

        evt.currentTarget.className += " active";
    }

    onSelectRelationship = (selectedRelationship) => {
        this.setState({
            selectedRelationship
        })
    }

    onToggleOptionChild = (option) => {
        if (option === this.state.activeOptionChild) {
            this.setState({
                activeOptionChild: false
            })
        } else {
            this.setState({
                activeOptionChild: option
            })
        }
    }


    onDeletePhoto = (index) => {
        var { filePhoto, fileUrl } = this.state;
        filePhoto.splice(index, 1)
        fileUrl.splice(index, 1)
        this.setState({
            fileUrl,
            filePhoto
        })
    }

    onChangeInput = (text, key, keyChild) => {
        var { post } = this.state
        post[key][keyChild] = text
        this.setState({
            post
        })
    }

    onChangeInputArr = (text, key, index, keyChild) => {
        var { post } = this.state
        if (!post[key][index]) {
            post[key][index] = {}
        }
        post[key][index][keyChild] = text
        this.setState({
            post
        })
    }

    onAddOption = (key) => {
        var { post } = this.state
        post[key].push({})
        this.setState({
            post
        })
    }

    onDeleteOption = (key, index) => {
        var { post } = this.state
        post[key].splice(index, 1)
        this.setState({
            post
        })
    }

    onValdiatePost = () => {
        var { post, preface, religion, fileUrl } = this.state
        if (!post.name.name) {
            Alert.error('Please type name')
            return false
        }


        if (!post.name.sex) {
            Alert.error('Please select sex')
            return false
        }


        if (!post.age.birth) {
            Alert.error('Please select birth date')
            return false
        }

        if (!post.age.loss) {
            Alert.error('Please select loss date')
            return false
        }

        if (!post.age.hometown) {
            Alert.error('Please type hometown')
            return false
        }

        if (!preface) {
            Alert.error('Please type preface')
            return false
        }

        if (!religion) {
            Alert.error('Please type religion')
            return false
        }

        if (!post.reason.reason) {
            Alert.error('Please type death reason')
            return false
        }

        if (!post.reason.place) {
            Alert.error('Please type death place')
            return false
        }

        if (!fileUrl || fileUrl.length === 0) {
            Alert.error('Please upload a picture')
            return false
        }

        return true
    }

    onUpdate = () => {
        var { post, preface, religion, fileUrl } = this.state
        var { postDetail } = this.props

        if (!this.onValdiatePost()) {
            return
        }

        post.preface = preface
        post.religion = religion
        post.relationship = {
            parents: post.parents,
            couple: post.couple,
            children: post.children
        }
        post.photos = fileUrl

        delete post.parents
        delete post.couple
        delete post.children
        delete post.postId

        const tx = window.empow.callABI(CONTRACT, "update", [this.props.myAddress, postDetail.postId, post])
        Utils.sendAction(tx, 100000, "pending").then((res) => {
            Alert.success("Update request has been sent")
            this.setState({
                post: {
                    type: "post",
                    name: {},
                    age: {},
                    preface: "",
                    education: [{}],
                    religion: "",
                    achievements: [{}],
                    reason: {},
                    parents: {},
                    couple: [{}],
                    children: [{}]
                }
            })
        }).catch(err => {
            Alert.error(err)
        })
    }

    onPost = () => {
        var { post, preface, religion, fileUrl } = this.state

        if (!this.onValdiatePost()) {
            return
        }
        post.preface = preface
        post.religion = religion
        post.relationship = {
            parents: post.parents,
            couple: post.couple,
            children: post.children
        }
        post.photos = fileUrl

        delete post.parents
        delete post.couple
        delete post.children

        const tx = window.empow.callABI(CONTRACT, "post", [this.props.myAddress, post])
        Utils.sendAction(tx, 100000, "pending").then((res) => {
            this.props.onPostSuccess(post)
            this.setState({
                post: {
                    type: "post",
                    name: {},
                    age: {},
                    preface: "",
                    education: [{}],
                    religion: "",
                    achievements: [{}],
                    reason: {},
                    parents: {},
                    couple: [{}],
                    children: [{}]
                }
            })
        }).catch(err => {
            Alert.error(err)
        })
    }

    renderPhotos() {
        const { filePhoto, fileUrl } = this.state
        var { postDetail } = this.props
        if (postDetail) {
            return (
                <div className="image-uploader has-files">
                    <div className="uploaded" style={{ display: 'flex', position: 'relative', padding: '20px' }}>
                        {fileUrl.map((value, index) => {
                            return (
                                <div className="uploaded-image" key={index} style={{ margin: '8px', position: 'relative' }}>
                                    <img src={value["670"]} alt="post" style={{ width: '100px', height: '100px' }} />
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', cursor: 'pointer' }} onClick={() => this.onDeletePhoto(index)}>
                                        <img src="/img/Group 8177.png" alt="" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        return (
            <div className="image-uploader has-files">
                <div className="uploaded" style={{ display: 'flex', position: 'relative', padding: '20px' }}>
                    {filePhoto.map((value, index) => {
                        return (
                            <div className="uploaded-image" key={index} style={{ margin: '8px', position: 'relative' }}>
                                <img src={value} alt="post" style={{ width: '100px', height: '100px' }} />
                                <div style={{ position: 'absolute', top: '5px', right: '5px', cursor: 'pointer' }} onClick={() => this.onDeletePhoto(index)}>
                                    <img src="/img/Group 8177.png" alt="" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    render() {
        var { filePhoto, activeOptionChild, post, preface, religion, isUploading, fileUrl, selectedRelationship } = this.state
        var { postDetail } = this.props
        return (
            <LoadingOverlay active={isUploading} spinner={true}>
                <div className="memorial-person-lost box-shadow-2">
                    <h2 className="title-header">
                        {LanguageService.changeLanguage('Keep_memories_of_the_deceased_here')}
                    </h2>
                    <div id="form-person-lost" encType="multipart/form-data">
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Name')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('name')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'name' && <div className="option-child">
                                        <div className="group-name-sex">
                                            <input value={post.name.name} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_name')} onChange={(e) => this.onChangeInput(e.target.value, "name", "name")} />
                                            <div className="group-radio">
                                                <label className="radio">
                                                    <input checked={post.name.sex === 'male'} type="radio" name="gender" defaultValue="male" onChange={(e) => this.onChangeInput(e.target.value, "name", "sex")} />
                                                    <span>{LanguageService.changeLanguage('Male')}</span>
                                                </label>
                                                <label className="radio">
                                                    <input checked={post.name.sex === 'female'} type="radio" name="gender" defaultValue="female" onChange={(e) => this.onChangeInput(e.target.value, "name", "sex")} />
                                                    <span>{LanguageService.changeLanguage('Female')}</span>
                                                </label>
                                                <label className="radio">
                                                    <input checked={post.name.sex === 'other'} type="radio" name="gender" defaultValue="other" onChange={(e) => this.onChangeInput(e.target.value, "name", "sex")} />
                                                    <span>{LanguageService.changeLanguage('Other')}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>}
                                </div>
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Age')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('age')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'age' && <div className="option-child">
                                        <DatePicker className="form-control"
                                            placeholderText={LanguageService.changeLanguage('Date_of_birth')}
                                            dateFormat="dd/MM/yyyy"
                                            selected={post.age.birth}
                                            onChange={(e) => this.onChangeInput(new Date(e).getTime(), "age", "birth")}
                                        />
                                        <DatePicker className="form-control"
                                            placeholderText={LanguageService.changeLanguage('Date_of_loss')}
                                            dateFormat="dd/MM/yyyy"
                                            selected={post.age.loss}
                                            onChange={(e) => this.onChangeInput(new Date(e).getTime(), "age", "loss")}
                                        />
                                        <input value={post.age.hometown} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_home_town')} onChange={(e) => this.onChangeInput(e.target.value, "age", "hometown")} />
                                    </div>}
                                </div>
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Preface')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('note')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'note' && <div className="option-child">
                                        <textarea name id rows={3} placeholder={LanguageService.changeLanguage('Enter_a_preface')} value={preface} onChange={(e) => { this.setState({ preface: e.target.value }) }} />
                                    </div>}
                                </div>
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Education')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('study')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'study' && <div className="option-child">
                                        {post.education.map((value, index) => {
                                            return (
                                                <div style={{ position: 'relative' }}>
                                                    {index > 0 && <div style={{ position: 'absolute', right: 10, top: -25 }} onClick={() => this.onDeleteOption("education", index)}>
                                                        <img src="/img/Group 8177.png" alt="" style={{ width: 25, height: 25 }} />
                                                    </div>}
                                                    <input value={value.name} onChange={(e) => this.onChangeInputArr(e.target.value, "education", index, "name")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_school_name')} />
                                                    <input value={value.degree} onChange={(e) => this.onChangeInputArr(e.target.value, "education", index, "degree")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Degree')} />
                                                    <DatePicker className="form-control"
                                                        placeholderText={LanguageService.changeLanguage('Enter_date')}
                                                        dateFormat="dd/MM/yyyy"
                                                        selected={value.date}
                                                        onChange={(e) => this.onChangeInputArr(new Date(e).getTime(), "education", index, "date")}
                                                    />
                                                </div>
                                            )
                                        })}

                                        <button className="btn add-new" onClick={() => this.onAddOption("education")}>
                                            <img src="/img/plus-l.png" alt="" />
                                        </button>
                                    </div>}
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Religion')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('religion')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'religion' && <div className="option-child">
                                        <input value={religion} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_religion')} onChange={(e) => { this.setState({ religion: e.target.value }) }} />
                                    </div>}
                                </div>
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Field_achievements')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('achievement')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'achievement' && <div className="option-child">
                                        {post.achievements.map((value, index) => {
                                            return (
                                                <div style={{ position: 'relative' }}>
                                                    {index > 0 && <div style={{ position: 'absolute', right: 10, top: -25 }} onClick={() => this.onDeleteOption("achievements", index)}>
                                                        <img src="/img/Group 8177.png" alt="" style={{ width: 25, height: 25 }} />
                                                    </div>}
                                                    <input value={value.field} onChange={(e) => this.onChangeInputArr(e.target.value, "achievements", index, "field")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_field')} />
                                                    <input value={value.achievement} onChange={(e) => this.onChangeInputArr(e.target.value, "achievements", index, "achievement")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_achievement')} />
                                                    <DatePicker className="form-control"
                                                        placeholderText={LanguageService.changeLanguage('Enter_date')}
                                                        dateFormat="dd/MM/yyyy"
                                                        selected={value.date}
                                                        onChange={(e) => this.onChangeInputArr(new Date(e).getTime(), "achievements", index, "date")}
                                                    />
                                                </div>
                                            )
                                        })}

                                        <button className="btn add-new" onClick={() => this.onAddOption("achievements")}>
                                            <img src="/img/plus-l.png" alt="" />
                                        </button>
                                    </div>}
                                </div>
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Reason_of_death_burial_place')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('reason')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'reason' && <div className="option-child">
                                        <input value={post.reason.reason} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_reason_of_death')} onChange={(e) => this.onChangeInput(e.target.value, "reason", "reason")} />
                                        <input value={post.reason.place} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_burial_place')} onChange={(e) => this.onChangeInput(e.target.value, "reason", "place")} />
                                    </div>}
                                </div>
                                <div className="form-group box-shadow-3 active">
                                    <span className="label">{LanguageService.changeLanguage('Relationship')}</span>
                                    <div className="options" onClick={() => this.onToggleOptionChild('relationship')}>
                                        <span>{LanguageService.changeLanguage('Add')}</span>
                                        <i className="fas fa-angle-right" />
                                    </div>
                                    {activeOptionChild === 'relationship' && <div className="option-child">
                                        <div className="tab">
                                            <button type="button" className={`tablinks ${selectedRelationship === "Parents" ? "active" : ""}`} onClick={() => this.onSelectRelationship('Parents')}>{LanguageService.changeLanguage('Parents')}</button>
                                            <button type="button" className={`tablinks ${selectedRelationship === "Couple" ? "active" : ""}`} onClick={() => this.onSelectRelationship('Couple')}>{LanguageService.changeLanguage('Couple')}</button>
                                            <button type="button" className={`tablinks ${selectedRelationship === "Children" ? "active" : ""}`} onClick={() => this.onSelectRelationship('Children')}>{LanguageService.changeLanguage('Children')}</button>
                                        </div>
                                        {selectedRelationship === "Parents" && <div id="London" className="tabcontent">
                                            <div className="option-child">
                                                <input value={post.parents.fatherName} onChange={(e) => this.onChangeInput(e.target.value, "parents", "fatherName")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_father_name')} />
                                                <DatePicker className="form-control"
                                                    placeholderText={LanguageService.changeLanguage('Date_of_birth')}
                                                    dateFormat="dd/MM/yyyy"
                                                    selected={post.parents.birthFather}
                                                    onChange={(e) => this.onChangeInput(new Date(e).getTime(), "parents", "birthFather")}
                                                />

                                                <DatePicker className="form-control"
                                                    placeholderText={LanguageService.changeLanguage('Date_of_loss')}
                                                    dateFormat="dd/MM/yyyy"
                                                    selected={post.parents.lossFather}
                                                    onChange={(e) => this.onChangeInput(new Date(e).getTime(), "parents", "lossFather")}
                                                />

                                                <input value={post.parents.motherName} onChange={(e) => this.onChangeInput(e.target.value, "parents", "motherName")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_mother_name')} />

                                                <DatePicker className="form-control"
                                                    placeholderText={LanguageService.changeLanguage('Date_of_birth')}
                                                    dateFormat="dd/MM/yyyy"
                                                    selected={post.parents.birthMother}
                                                    onChange={(e) => this.onChangeInput(new Date(e).getTime(), "parents", "birthMother")}
                                                />

                                                <DatePicker className="form-control"
                                                    placeholderText={LanguageService.changeLanguage('Date_of_loss')}
                                                    dateFormat="dd/MM/yyyy"
                                                    selected={post.parents.lossMother}
                                                    onChange={(e) => this.onChangeInput(new Date(e).getTime(), "parents", "lossMother")}
                                                />
                                            </div>
                                        </div>}
                                        {selectedRelationship === "Couple" && <div id="Paris" className="tabcontent">
                                            <div className="option-child">
                                                {post.couple.map((value, index) => {
                                                    return (
                                                        <div style={{ position: 'relative' }}>
                                                            {index > 0 && <div style={{ position: 'absolute', right: 10, top: -25 }} onClick={() => this.onDeleteOption("couple", index)}>
                                                                <img src="/img/Group 8177.png" alt="" style={{ width: 25, height: 25 }} />
                                                            </div>}
                                                            <input value={value.name} onChange={(e) => this.onChangeInputArr(e.target.value, "couple", index, "name")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_couple_name')} />

                                                            <DatePicker className="form-control"
                                                                placeholderText={LanguageService.changeLanguage('Date_of_marriage')}
                                                                dateFormat="dd/MM/yyyy"
                                                                selected={value.date}
                                                                onChange={(e) => this.onChangeInputArr(new Date(e).getTime(), "couple", index, "date")}
                                                            />
                                                        </div>
                                                    )
                                                })}

                                                <button className="btn add-new" onClick={() => this.onAddOption("couple")}>
                                                    <img src="/img/plus-l.png" alt="" />
                                                </button>
                                            </div>
                                        </div>}
                                        {selectedRelationship === "Children" && <div id="Tokyo" className="tabcontent">
                                            <div className="option-child">
                                                {post.children.map((value, index) => {
                                                    return (
                                                        <div style={{ position: 'relative' }}>
                                                            {index > 0 && <div style={{ position: 'absolute', right: 10, top: -25 }} onClick={() => this.onDeleteOption("children", index)}>
                                                                <img src="/img/Group 8177.png" alt="" style={{ width: 25, height: 25 }} />
                                                            </div>}
                                                            <div className="group-name-sex">
                                                                <input value={value.name} onChange={(e) => this.onChangeInputArr(e.target.value, "children", index, "name")} type="text" className="form-control" placeholder={LanguageService.changeLanguage('Enter_the_child_name')} />
                                                                <div className="group-radio">
                                                                    <label className="radio">
                                                                        <input checked={value.sex === 'male'} onChange={(e) => this.onChangeInputArr(e.target.value, "children", index, "sex")} type="radio" name={"gender" + index} defaultValue="male" />
                                                                        <span>{LanguageService.changeLanguage('Male')}</span>
                                                                    </label>
                                                                    <label className="radio">
                                                                        <input checked={value.sex === 'female'} onChange={(e) => this.onChangeInputArr(e.target.value, "children", index, "sex")} type="radio" name={"gender" + index} defaultValue="female" />
                                                                        <span>{LanguageService.changeLanguage('Female')}</span>
                                                                    </label>
                                                                    <label className="radio">
                                                                        <input checked={value.sex === 'other'} onChange={(e) => this.onChangeInputArr(e.target.value, "children", index, "sex")} type="radio" name={"gender" + index} defaultValue="other" />
                                                                        <span>{LanguageService.changeLanguage('Other')}</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <DatePicker className="form-control"
                                                                placeholderText={LanguageService.changeLanguage('Date_of_birth')}
                                                                dateFormat="dd/MM/yyyy"
                                                                selected={value.date}
                                                                onChange={(e) => this.onChangeInputArr(new Date(e).getTime(), "children", index, "date")}
                                                            />
                                                        </div>
                                                    )
                                                })}

                                                <button className="btn add-new" onClick={() => this.onAddOption("children")}>
                                                    <img src="/img/plus-l.png" alt="" />
                                                </button>
                                            </div>
                                        </div>}
                                    </div>}
                                </div>
                            </div>
                            {(!postDetail && filePhoto) && this.renderPhotos()}
                            {(postDetail && fileUrl) && this.renderPhotos()}
                            <div className="col-12 bottom">
                                <div className="left">
                                    <div className="input-field photo" onClick={() => this.upLoadPhoto()}>
                                        <img src="/img/Group 8383@2x.png" alt="" />
                                        <input multiple accept=".gif,.png,.jpg" type="file" id="file" ref="fileUploader" name="photo" style={{ display: "none" }} onChange={(event) => this.handleChange(event)} />
                                    </div>
                                </div>
                                <div className="right">
                                    {!postDetail && <button className="btn post" onClick={() => this.onPost()}>{LanguageService.changeLanguage('Post')}</button>}
                                    {postDetail && <button className="btn post" onClick={() => this.onUpdate()}>{LanguageService.changeLanguage('Update')}</button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LoadingOverlay>
        )
    }
};


export default connect(state => ({
    myAddress: state.app.myAddress
}), ({
}))(Navbar)