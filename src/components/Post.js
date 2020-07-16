import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux';
import {
    setPostDetail,
} from '../reducers/appReducer'
import LanguageService from '../services/LanguageService'
import dynamic from 'next/dynamic';
import Utils from '../utils/index'
import Link from 'next/link'
import { CONTRACT } from '../constants/index'
import Alert from 'react-s-alert';
import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    TelegramShareButton,
    RedditShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    TelegramIcon,
    RedditIcon
} from "react-share";
import Photo from '../assets/images/Path953.svg'
import TextareaAutosize from 'react-textarea-autosize';
import Avatar from '../assets/images/avatar.svg'
import moment from 'moment'
import ServerAPI from '../ServerAPI'
import LoadingOverlay from 'react-loading-overlay';
import _ from 'lodash'
import Socket from '../Socket'

const Viewer = dynamic(import('react-viewer'), { ssr: false });

class Post extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showComment: false,
            post: this.props.post,
            limitComment: 5,
            limitReply: 20,
            indexLoadReply: 0,
            isUploading: false,
            file: false,
            fileReply: false,
            pageComment: 1,
            pageReply: 0,
            commentHeight: 265,
            totalLike: this.props.post.totalLike,
            isLiked: this.props.post.isLiked,
            totalCommentAndReply: this.props.post.totalCommentAndReply,
            realLike: this.props.post.realLike
        }
    };

    componentDidMount() {
        this.callSocket()
    }

    async componentDidUpdate(pre) {
        if (_.isEqual(pre.post, this.props.post)) {
            return;
        }

       
        this.setState({
            post: this.props.post,
            totalLike: this.props.post.totalLike,
            isLiked: this.props.post.isLiked,
            totalCommentAndReply: this.props.post.totalCommentAndReply,
            realLike: this.props.post.realLike
        })
        this.callSocket()
    }

    callSocket = async () => {
        var socket = await Socket.getSocket()
        var postId = this.props.post.postId

        socket.emit("get_new_post", postId)
        socket.on("res_new_post", (post) => {
            if (post.postId === postId) {
                this.updateData(post)
            }
        });

        socket.emit("get_new_comment_data", postId)
        socket.on("res_new_comment_data", (comment) => {
            if (comment.postId === postId) {
                this.updateCommentData(comment)
            }

        });
    }

    updateData = (newPost) => {
        this.setState({
            totalLike: newPost.totalLike,
            totalCommentAndReply: newPost.totalCommentAndReply,
            realLike: newPost.realLike
        })
    }

    updateCommentData = (commentRes) => {
        var post = this.state.post;
        for (let j = 0; j < post.comment.length; j++) {
            if (post.comment[j].type === "comment" && post.comment[j].commentId === commentRes.commentId) {
                post.comment[j] = _.merge(post.comment[j], commentRes)
                this.setState({
                    post
                })
                return;
            }
        }

        post.comment.unshift(commentRes)
    }


    onLike = async () => {
        var { post } = this.state;
        var { myAddress } = this.props;

        if (!myAddress) {
            return;
        }

        if (post.author === myAddress) {
            return;
        }

        const tx = window.empow.callABI(CONTRACT, "like", [myAddress, post.newestPostId])
        this.setState({
            isLiked: true
        })

        Utils.sendAction(tx).then(res => {

        }).catch(err => {
            Alert.error(err)
        })
    }

    handleChangeTextComment = (event) => {
        var post = this.state.post;
        post.commentText = event.target.value
        this.setState({
            post
        });
    }

    handleKeyDownComment = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            var post = this.state.post;
            const tx = window.empow.callABI(CONTRACT, "comment", [this.props.myAddress, post.newestPostId, "comment", "0", post.commentText, post.attachment])
            Utils.sendAction(tx).then(res => {
            }).catch(err => {
                Alert.error(err)
            })

            post.commentText = ''
            delete post.attachment
            this.setState({
                post,
                file: false
            })
        }
    }

    upLoadPhoto = () => {
        this.refs.fileUploader.click();
    }

    uploadImage = async (file, type, index = false) => {
        const data = new FormData()
        data.append('file', file)
        try {
            const fileUrl = await ServerAPI.uploadPhoto(data, "[200]")
            var attachment = {
                type: 'photo',
                data: fileUrl.dataResize200,
            }

            var { post } = this.state;
            if (type === 'reply') {
                post.comment[index].attachmentReply = attachment
            } else {
                post.attachment = attachment
            }

            this.setState({
                post,
                isUploading: false
            })
        } catch (err) {
            Alert.error(err.message ? err.message : err)
        }
    }

    handleChange = (event, type, index = false) => {
        if (event.target.files.length > 0) {
            var file = URL.createObjectURL(event.target.files[0]);

            this.setState({
                isUploading: true,
            })

            this.uploadImage(event.target.files[0], type, index)

            if (type === 'reply') {
                let { post } = this.state
                post.comment[index].fileReply = file
                this.setState({
                    post
                })
            } else {
                this.setState({
                    file
                })
            }
        }
    }

    onClickPhotoComent = () => {
        var { post, isUploading } = this.state

        if (isUploading) {
            return
        }

        delete post.attachment;
        this.setState({
            file: false,
            post
        })
    }

    setVisible = (visible, indexx) => {
        var { post } = this.state;
        post.comment[indexx].visible = visible
        this.setState({
            post
        })
    }

    onToggleComment = async () => {
        var { showComment, post } = this.state
        var { myAddress } = this.props
        if (!showComment) {
            var comment = await ServerAPI.getComments(post.postId, myAddress)
            post.comment = comment
        }
        this.setState({
            showComment: !showComment,
            post
        })
    }

    onLikeComment = (comment, index) => {
        if (!this.props.myAddress) {
            return;
        }

        var { post } = this.state

        const tx = window.empow.callABI(CONTRACT, "likeComment", [this.props.myAddress, post.postId, comment.commentId.toString()])

        Utils.sendAction(tx).then(res => {
            post.comment[index].isLiked = true
            this.setState({
                post
            })
        }).catch(err => {
            Alert.error(err)
        })
    }


    onClickReply = (indexx, replyUser) => {
        var post = this.state.post;
        post.comment[indexx].showReply = !post.comment[indexx].showReply
        if (post.comment[indexx].showReply) {
            post.comment[indexx].replyUser = replyUser
        }
        this.setState({
            post,
        });
    }

    handleChangeTextReply = (event, indexx) => {
        var post = this.state.post;
        post.comment[indexx].replyText = event.target.value
        this.setState({
            post
        });
    }

    handleKeyDownReply = (e, comment, index) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const tx = window.empow.callABI(CONTRACT, "comment", [this.props.myAddress, comment.postId, "reply", comment.commentId.toString(), comment.replyText, comment.attachmentReply])
            Utils.sendAction(tx).then(res => {
                let post = this.state.post;
                post.comment[index].replyText = ''
                delete post.comment[index].fileReply
                this.setState({
                    post,
                })
            }).catch(err => {
                Alert.error(err)
            })
        }
    }

    onLoadMoreReply = async (comment, index) => {
        var { post, limitReply, indexLoadReply, pageReply } = this.state
        if (index !== indexLoadReply) {
            pageReply = 0
        }
        var reply = await ServerAPI.getReplys(post.postId, comment.commentId, pageReply + 1, limitReply)

        if (!post.comment[index].reply) {
            post.comment[index].reply = []
        }
        for (let i = 0; i < reply.length; i++) {
            post.comment[index].reply.push(reply[i])
        }

        this.setState({
            post,
            pageReply: pageReply + 1
        })
    }

    onLoadMoreComent = async () => {
        var { post, limitComment, pageComment } = this.state
        var { myAddress } = this.props
        var comment = await ServerAPI.getComments(post.postId, myAddress, pageComment + 1, limitComment)
        for (let i = 0; i < comment.length; i++) {
            post.comment.push(comment[i])
        }

        this.setState({
            pageComment: pageComment + 1,
            post
        })
    }

    onReportPost = (tag) => {
        var { post } = this.state
        const { myAddress } = this.props

        const tx = window.empow.callABI(CONTRACT, "report", [myAddress, post.postId, tag])
        Utils.sendAction(tx).then(res => {
            post.inReportPending = tag
            this.setState({
                post
            })
        }).catch(err => {
            Alert.error(err)
        })
    }

    renderPhotoComment(file) {
        const { isUploading } = this.state
        return (
            <div onClick={() => this.onClickPhotoComent()} style={{ width: 200 }}>
                <LoadingOverlay active={isUploading} spinner={true}>
                    <img style={{ marginRight: '10px', width: '100%' }} src={file} alt="photos"></img>
                </LoadingOverlay>
            </div>
        )
    }

    renderAttachment(detail, indexx) {
        var attachment = detail.attachment
        var data = attachment.data
        return (
            <div className="attachment">
                <img style={{ marginRight: '10px', width: '100%', marginTop: '10px' }}
                    src={data} alt="photos"
                    onClick={() => this.setVisible(true, indexx)}
                ></img>
                <Viewer
                    visible={detail.visible}
                    onClose={() => this.setVisible(false, indexx)}
                    images={[{ src: data, alt: 'photos' }]}
                />
            </div>
        )
    }

    renderComment() {
        var { myAddress, route, blockNumber } = this.props;
        var { post, file } = this.state;
        var comment = post.comment || []
        return (
            <Fragment>
                {myAddress &&
                    <Fragment>
                        <div className="waper-cmt">
                            <TextareaAutosize
                                maxRows={6}
                                placeholder="Comment"
                                value={post.commentText}
                                onChange={(e) => this.handleChangeTextComment(e)}
                                onKeyDown={(e) => this.handleKeyDownComment(e)}
                            />

                            <div style={{ display: 'flex' }}>
                                <div onClick={() => this.upLoadPhoto()} style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={Photo} alt="photos"></img>
                                    <input multiple accept=".png,.jpg" type="file" id="file" ref="fileUploader" name="photo" style={{ display: "none" }} onChange={(event) => this.handleChange(event, 'comment')} />
                                </div>
                            </div>
                        </div>
                        {file && this.renderPhotoComment(file)}
                    </Fragment>
                }
                {(comment && comment.length > 0) &&
                    <div className="comment">
                        <ul style={{ height: "auto" }} className={`coment ${route !== "PostDetail" ? "scroll" : ""}`}>
                            {comment.map((detail, indexx) => {
                                var addressComment = detail.address || [];
                                var pro5 = addressComment.profile || {};
                                var ava = pro5.avatar50 || pro5.avatar || Avatar
                                var reply = detail.reply;
                                detail.canWithdraw = Utils.calcCanWithdraw(blockNumber, detail.realLikeArray, detail.lastBlockWithdraw)
                                return (
                                    <li key={indexx} onClick={() => this.onClickReply(indexx, addressComment.selected_username ? addressComment.selected_username : addressComment.address)}>
                                        <div className="group1">
                                            <div className="info">
                                                <div className="avatar">
                                                    <Link href="/[account]" as={`/${addressComment.selected_username ? addressComment.selected_username : addressComment.address}`}>
                                                        <a href={`/${addressComment.selected_username ? addressComment.selected_username : addressComment.address}`}
                                                            className="waper-avatar"
                                                            style={{ backgroundImage: `url(${ava})`, marginRight: '10px' }}>
                                                        </a>
                                                    </Link>
                                                </div>
                                                <div style={{ display: "inline-block" }}>
                                                    <Link href="/[account]" as={`/${addressComment.selected_username ? addressComment.selected_username : addressComment.address}`}>
                                                        <a href={`/${addressComment.selected_username ? addressComment.selected_username : addressComment.address}`}
                                                            className="username"
                                                            style={{ fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                                                        >{addressComment.selected_username ? addressComment.selected_username : (addressComment.address ? addressComment.address.substr(0, 15) + '...' : '...')} <span className="comment-time">{moment(detail.time / 10 ** 6).fromNow()}</span>
                                                        </a>
                                                    </Link>
                                                    <p className="content">{detail.content}</p>
                                                    {detail.attachment && this.renderAttachment(detail, indexx)}
                                                </div>

                                            </div>
                                            <div className="reaction reaction-comment">

                                                {!detail.isLiked && <div className="one-reaction" onClick={() => this.onLikeComment(detail, indexx)}>
                                                    <img src="/img/Group 8423.png" alt="" srcSet />
                                                </div>}

                                                {detail.isLiked && <div className="one-reaction">
                                                    <img src="/img/Group 8420.png" alt="" srcSet />
                                                </div>}

                                                <div className="one-reaction money">
                                                    <p><b>{detail.realLike}</b> EM</p>
                                                    <div className="popup popup-money">
                                                        <div>
                                                            <p>Total Reward</p>
                                                            <p>{Utils.formatCurrency(detail.realLike)} EM</p>
                                                        </div>
                                                        <div>
                                                            <p>Can Withdraw</p>
                                                            <p>{Utils.formatCurrency(detail.canWithdraw)} EM</p>
                                                        </div>
                                                        {(addressComment.address === this.props.myAddress && detail.canWithdraw > 0) && <button className="btn-general-2" onClick={() => this.onWithdrawComment(detail, indexx)}>Withdraw {Utils.formatCurrency(detail.canWithdraw)} EM</button>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                        {(myAddress && detail.showReply) && <div style={{ width: 'calc(100% - 50px)', marginLeft: 50 }}>
                                            <div className="waper-cmt wrapper-reply">
                                                <TextareaAutosize
                                                    maxRows={6}
                                                    placeholder={`Reply ${detail.replyUser}`}
                                                    value={detail.replyText}
                                                    onChange={(e) => this.handleChangeTextReply(e, indexx)}
                                                    onKeyDown={(e) => this.handleKeyDownReply(e, detail, indexx)}
                                                />

                                                <div style={{ display: 'flex' }}>
                                                    <div onClick={() => this.upLoadPhoto()} style={{ display: 'flex', alignItems: 'center' }}>
                                                        <img src={Photo} alt="photos"></img>
                                                        <input multiple accept=".png,.jpg" type="file" id="file" ref="fileUploader" name="photo" style={{ display: "none" }} onChange={(event) => this.handleChange(event, 'reply', indexx)} />
                                                    </div>
                                                </div>
                                            </div>

                                            {detail.fileReply && this.renderPhotoComment(detail.fileReply)}
                                        </div>}

                                        {(reply && reply.length > 0) && <ul className="reply-coment">
                                            {reply.map((detailReply, keykey) => {
                                                var addressReply = detailReply.address || [];
                                                var pro5Reply = addressReply.profile || {}

                                                return (
                                                    <li style={{ borderBottomWidth: '0px' }} key={keykey}>
                                                        <div className="avatar">
                                                            <Link href="/[account]" as={`/${addressReply.selected_username ? addressReply.selected_username : addressReply.address}`}>
                                                                <a href={`/${addressReply.selected_username ? addressReply.selected_username : addressReply.address}`}
                                                                    className="waper-avatar"
                                                                    style={{ backgroundImage: `url(${pro5Reply.avatar ? pro5Reply.avatar : Avatar})`, marginRight: '10px' }}>
                                                                </a>
                                                            </Link>
                                                        </div>
                                                        <div className="info">
                                                            <Link href="/[account]" as={`/${addressReply.selected_username ? addressReply.selected_username : addressReply.address}`}><a className="username" href={`/${addressReply.selected_username ? addressReply.selected_username : addressReply.address}`} style={{ fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>{addressReply.selected_username ? addressReply.selected_username : addressReply.address.substr(0, 15) + '...'} <span className="comment-time">{moment(detailReply.time / 10 ** 6).fromNow()}</span></a></Link>
                                                            <p className="content">{detailReply.content}</p>
                                                        </div>
                                                        {detailReply.attachment && this.renderAttachment(detailReply, keykey)}
                                                    </li>
                                                )
                                            })}

                                        </ul>}

                                        <div className="load-more-reply" onClick={() => this.onLoadMoreReply(detail, indexx)}>
                                            {(!(reply && reply.length > 0) && detail.totalReply > 0) && <p>View {detail.totalReply} Replies</p>}
                                            {(reply && detail.totalReply > reply.length) && <p>Load more replies...</p>}
                                        </div>

                                    </li>
                                )
                            })}

                            {post.totalComment > post.comment.length && <div className="load-more-comment" onClick={() => this.onLoadMoreComent()}>
                                <p>Load more comments...</p>
                            </div>}
                        </ul>
                    </div>
                }
            </Fragment>
        )
    }

    renderReaction() {
        var { post, reportTagArray } = this.props
        var { isLiked } = this.state
        const shareUrl = `http://localhost:3000/post/${post.postId}`
        return (
            <div className="box bottom">
                {!isLiked && <span onClick={() => this.onLike()}><img src="/img/respect.png" alt="" srcSet /> {LanguageService.changeLanguage('respect')}</span>}
                {isLiked && <span><img src="/img/Group 8535.png" alt="" srcSet /> {LanguageService.changeLanguage('respect')}</span>}
                <span onClick={() => this.onToggleComment()}><img src="/img/comment.png" alt="" srcSet /> {LanguageService.changeLanguage('comment')}</span>
                <div className="one-reaction share">
                    <span onClick={() => this.onShare()}><img src="/img/share.png" alt="" srcSet /> {LanguageService.changeLanguage('share')}</span>
                    <div className="popup popup-share">
                        <div>
                            <FacebookShareButton
                                url={shareUrl}
                                className="child-share"
                            >
                                <FacebookIcon size={20} round={true} />
                                <p>Share on Facebook</p>
                            </FacebookShareButton>
                        </div>
                        <div>
                            <TwitterShareButton
                                url={shareUrl}
                                className="child-share"
                            >
                                <TwitterIcon size={20} round={true} />
                                <p>Share on Twitter</p>
                            </TwitterShareButton>
                        </div>
                        <div>
                            <WhatsappShareButton
                                url={shareUrl}
                                title={post.preface}
                                separator=":: "
                                className="child-share"
                            >
                                <WhatsappIcon size={20} round={true} />
                                <p>Share on Whatsapp</p>
                            </WhatsappShareButton>
                        </div>
                        <div>
                            <TelegramShareButton
                                url={shareUrl}
                                title={post.preface}
                                className="child-share"
                            >
                                <TelegramIcon size={20} round={true} />
                                <p>Share on Telegram</p>
                            </TelegramShareButton>
                        </div>
                        <div>
                            <RedditShareButton
                                url={shareUrl}
                                title={post.preface}
                                className="child-share"
                            >
                                <RedditIcon size={20} round={true} />
                                <p>Share on Reddit</p>
                            </RedditShareButton>
                        </div>
                    </div>
                </div>


                <div className="one-reaction report">
                    <span onClick={() => this.onReport()}><img src="/img/report.png" alt="" srcSet /> {LanguageService.changeLanguage('report')}</span>
                    <div className="popup popup-report">
                        {post.inReportPending ?
                            <p>This post is awaiting <Link href="/verifier"><a href="/verifier">verify</a></Link></p>
                            :
                            <Fragment>
                                <p className="report-title">Report this post</p>
                                {reportTagArray.map((value, index) => {
                                    return <div key={index} onClick={() => this.onReportPost(value)} className="one-report-tag">{Utils.properCase(value)}</div>
                                })}
                            </Fragment>
                        }
                    </div>
                </div>
            </div>
        )
    }

    render() {
        var { post, route } = this.props
        var { showComment, totalLike, totalCommentAndReply, realLike } = this.state
        return (
            <div>
                <div className="post">
                    <Link href="/post/[postId]" as={`/post/${post.postId}`}>
                        <a href={`/post/${post.postId}`}>
                            <div className="top-user">
                                <div className="waper-avatar" style={{ backgroundImage: `url(${post.photos[0]["670"]})`, marginRight: 10 }}>

                                </div>
                                <div className="info-post">
                                    <span className="name-user">
                                        {post.name.name}
                                    </span>
                                    <span className="date">{Utils.convertDate(post.age.birth)} - {Utils.convertDate(post.age.loss)}</span>
                                </div>

                            </div>
                        </a>
                    </Link>
                    <div className="post-image">
                        <img src={post.photos[0]["670"]} alt="" />
                    </div>
                    <div className="box">
                        <div className="box badges">
                            <span className="badges-grey">
                                {post.religion}
                            </span>
                            {post.education[0].name && <span className="badges-grey">
                                {post.education[0].name}
                            </span>}
                            {post.achievements[0].achievement && <span className="badges-grey">
                                {post.achievements[0].achievement}
                            </span>}
                            {post.relationship.couple && <span className="badges-grey">
                                {LanguageService.changeLanguage('Married')}
                            </span>}
                            {post.achievements[0].field && <span className="badges-grey">
                                {post.achievements[0].field}
                            </span>}
                        </div>
                        <div className="content">
                            <div className="row">
                                <div className="col-6">
                                    <ul>
                                        <li>
                                            {LanguageService.changeLanguage('Home_town')}
                                            <span>{post.age.hometown}</span>
                                        </li>
                                        <li>
                                            {LanguageService.changeLanguage('Burial_place')}
                                            <span>{post.reason.place}</span>
                                        </li>
                                        <li>
                                            {LanguageService.changeLanguage('Downtime')}
                                            <span>{Utils.convertDate(post.age.loss)}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-6">
                                    <ul>
                                        <li>
                                            {LanguageService.changeLanguage('Achievement')}
                                            {post.achievements.map((value, index) => {
                                                if (value.field && value.achievement) {
                                                    return <span>{value.field}: {value.achievement}</span>
                                                }
                                            })}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {route !== "Validator" && <div className="box-like">
                            <div className="count-like">
                                <span>{totalLike || 0}</span>
                                <span>{realLike || 0} EM</span>
                            </div>
                            <div className="count-comments">
                                <span>{totalCommentAndReply || 0} comments</span>
                            </div>
                        </div>}
                    </div>
                    {route !== "Validator" && this.renderReaction()}
                    {showComment && this.renderComment()}
                </div>
            </div>
        )
    }
};


export default connect(state => ({
    myAddress: state.app.myAddress,
    myAccountInfo: state.app.myAccountInfo,
    typeNewFeed: state.app.typeNewFeed,
    reportTagArray: state.app.reportTagArray,
    blockNumber: state.app.blockNumber
}), ({
    setPostDetail
}))(Post)