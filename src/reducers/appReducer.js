import { createReducer, createAction } from 'redux-starter-kit';

export const setMyAddress = createAction('setMyAddress');
export const setMyAccountInfo = createAction('setMyAccountInfo');
export const setPostDetail = createAction('setPostDetail');
export const setReportTagArray = createAction('setReportTagArray');
export const setBlockNumber = createAction('setBlockNumber')
export const setTypeNewFeed = createAction('setTypeNewFeed');

export const appReducer = createReducer({
    myAddress: false,
    myAccountInfo: false,
    postDetail: false,
    reportTagArray: [],
    blockNumber: false,
    typeNewFeed: 'trending',
}, {
    [setMyAddress]: (state, { payload }) => {
        state.myAddress = payload;
    },
    [setMyAccountInfo]: (state, { payload }) => {
        state.myAccountInfo = payload;
    },
    [setPostDetail]: (state, { payload }) => {
        state.postDetail = payload;
    },
    [setReportTagArray]: (state, { payload }) => {
        state.reportTagArray = payload;
    },
    [setBlockNumber]: (state, { payload }) => {
        state.blockNumber = payload;
    },
    [setTypeNewFeed]: (state, { payload }) => {
        state.typeNewFeed = payload;
    },
});