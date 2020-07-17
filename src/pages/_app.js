import React from 'react'
import withRedux from 'next-redux-wrapper'
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import '../assets/scss/style.scss'
import { Provider } from "react-redux";
import reducer from '../reducers/index'
import App from "next/app";
import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import Header from '../components/Header'
import Head from 'next/head'
import Socket from '../Socket'
import Alert from 'react-s-alert';

const makeStore = (initialState, options) => {
    return configureStore({
        middleware: [
            ...getDefaultMiddleware(),
            // reduxLogger
        ],
        reducer
    })
}

class MyApp extends App {

    static async getInitialProps({ Component, ctx }) {

        // we can dispatch from here too
        // ctx.store.dispatch({type: 'FOO', payload: 'foo'});

        const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

        return { pageProps };

    }

    componentDidMount() {
        Socket.connect()
    }

    render() {
        const { Component, pageProps, store } = this.props;

        return (
            <Provider store={store}>
                <Alert stack={{ limit: 3 }} timeout={10000} html={true} position="bottom-left"></Alert>
                <Head>
                    <title>Heavenbook.io</title>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous"/>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css"/>
                </Head>
                <Header>
                </Header>
                <Component {...pageProps} />
            </Provider>
        );
    }

}

export default withRedux(makeStore)(MyApp);