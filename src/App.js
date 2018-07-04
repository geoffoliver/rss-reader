import React, { Component } from 'react';
import Parser from "rss-parser";
import Moment from "react-moment";
import "moment-timezone";

import './App.css';

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
    this.setState({
      loaded: 0
    }, () => {
      feedList.map(this.loadFeed);
    });
  }

  loadFeed = ({name, url}) => {
    (async () => {
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
    })();
  }

  render() {
    let items = [];

    if (!this.state.loading) {
      for (let feedName in this.state.feeds) {
        items = items.concat(this.state.feeds[feedName].map((i) => {
          i.pubDate = new Date(i.pubDate);
          return i;
        }));
      }
      items.sort((a, b) => {
        return b.pubDate - a.pubDate;
      });
    }

    return (
      <div className="App">
        <div style={{ paddingBottom: '30px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>Feeds</h1>
          <a
            title="Refresh"
            style={{ float: 'right', cursor: 'pointer', fontSize: '2rem' }}
            onClick={(e) => { this.loadFeeds(); e.preventDefault(); }}
            id="refreshFeed"
          >
            <span role="img" aria-label="Refresh" title="Refresh">🔄</span>
          </a>
        </div>
        {this.state.loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading {this.state.loaded} of {feedList.length}...</div>}
        {items.length > 0 && <React.Fragment>
          {items.map((item, i) => {
            return <div key={i} style={{ padding: '0 0 15px' }}>
              <h2 style={{ margin: 0 }}>
                <a href={item.link} target="_blank">
                  {item.title}
                </a>
                <br />
                <small>
                  <Moment format="dddd, MMMM Do, YYYY \a\t h:mm A" date={item.pubDate} />
                </small>
              </h2>
              <div style={{ padding: '15px 0' }} dangerouslySetInnerHTML={{ __html: item.content }} />
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                {item.source}
              </div>
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
