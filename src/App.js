import React, { Component } from 'react';
import Parser from "rss-parser";
import Moment from "react-moment";
import "moment-timezone";

import './App.css';

import syncIcon from './sync-light.svg';

const parser = new Parser();

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

const feedList = [
  {'name': 'reddit', 'url':'https://www.reddit.com/.rss'},
  {'name': 'digg', 'url':'http://digg.com/rss/top.rss'},
  {'name': 'lifehacker', 'url': 'https://lifehacker.com/rss'},
  {'name': 'boing boing', 'url': 'https://boingboing.net/feed'},
  {'name': 'kottke', 'url': 'http://feeds.kottke.org/main'},
  {'name': 'the daily wtf', 'url': 'http://syndication.thedailywtf.com/TheDailyWtf'}
];

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      feeds: {},
      feed: "",
      loaded: 0
    };
  }

  componentDidMount() {
    this.setState({
      loading: true
    });

    this.loadFeeds();
  }

  loadFeeds = () => {
    if (this.state.loading) {
      alert('Please be patient, your feeds are loading.');
      return;
    }

    this.setState({
      loading: true,
      loaded: 0
    }, () => {
      feedList.map(this.loadFeed);
    });
  }

  loadFeed = ({name, url}) => {
    (async () => {
      try {
        let feed = await parser.parseURL(CORS_PROXY + url);
        let newState = {
          feeds: this.state.feeds,
          loaded: (this.state.loaded + 1),
        };

        newState.feeds[name] = feed.items.map((i) => {
          i.source = name;
          return i;
        });

        this.setState(newState, () => {
          this.setState({
            loading: (this.state.loaded !== feedList.length)
          });
        });
      }catch(ex) {
        console.log('error', ex);
        const loaded = this.state.loaded + 1;
        this.setState({
          loaded: loaded,
          loading: (loaded !== feedList.length)
        });
      }
    })();
  }

  render() {
    let items = [];

    const massageFeedItem = (i) => {
        i.pubDate = new Date(i.pubDate);
        return i;
    };

    //if (!this.state.loading) {
      if (this.state.feed) {
        items = this.state.feeds[this.state.feed].map(massageFeedItem);
      } else {
        for (let feedName in this.state.feeds) {
          items = items.concat(this.state.feeds[feedName].map(massageFeedItem));
        }
      }
      items.sort((a, b) => {
        return b.pubDate - a.pubDate;
      });
    //}

    const getHost = (url) => {
      const link = document.createElement('a');
      link.href = url;
      return link.hostname;
    };

    return (
      <div className="App">
        {this.state.loading && <div className="loading">Loading {this.state.loaded + 1} of {feedList.length}...</div>}
        <div className="header">
          <div className="header-container">
            <h1>Feeds</h1>
            <div style={{ display: "flex", alignItems: "center" }}>
              <select value={this.state.feed} onChange={(e) => {this.setState({feed: e.target.value})}}>
                <option value="">All Feeds</option>
                {feedList.map((k, i) => <option value={k.name} key={i}>{k.name}</option>)}
              </select>
              <a
                title="Refresh"
                style={{ float: 'right', cursor: 'pointer', marginLeft: '1rem' }}
                onClick={(e) => { this.loadFeeds(); e.preventDefault(); }}
                id="refreshFeed"
              >
                <img src={syncIcon} alt="Refresh" className={this.state.loading ? "loading" : null}/>
                {/*<span role="img" aria-label="Refresh" title="Refresh">🔄</span>*/}
              </a>
            </div>
          </div>
        </div>
        {items.length > 0 && <React.Fragment>
          {items.map((item, i) => {
            return <div key={i} className="feed-item">
              <h2 style={{ margin: 0 }} className="feed-title">
                <a href={item.link} target="_blank">
                  {item.title}
                </a>
                <br />
                <small>
                  <a onClick={() => {this.setState({feed: item.source})}}>{item.source}</a>
                  {" via "}
                  {getHost(item.link)}
                  {" • "}
                  <Moment format="dddd, MMMM Do, YYYY \a\t h:mm A" date={item.pubDate} />
                </small>
              </h2>
              <div className="feed-content" dangerouslySetInnerHTML={{ __html: item.content }} />
              <hr />
            </div>;
          })}
        </React.Fragment>}
        {!this.state.loading && items.length === 0 && <React.Fragment>
          <div style={{ color: '#ff0000', fontWeight: 'bold' }}>
            There is nothing to display.
          </div>
        </React.Fragment>}
      </div>
    );
  }
}

export default App;
