import React, { Component } from 'react';
import {
  Button,
  Row,
  Col,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  Form, FormGroup,Label
} from 'reactstrap';
import LibraryEdit from './LibraryEdit';

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { config: { libraries: [] } };
    this._formSubmit = this._upsertLib.bind(this);
    this._getConfigData = this._getConfigData.bind(this);
    this._initLibraries = this._initLibraries.bind(this);
    this._removeLibrary = this._removeLibrary.bind(this);
    this._upsertLib = this._upsertLib.bind(this);
  }
  componentDidMount() {
    this._getConfigData();
  }
  _getConfigData() {
    fetch('/api/admin/config')
      .then(response => response.json())
      .then(config => this.setState({ config }))
      .catch(console.log);
  }
  _sendConfig(config) {
    return fetch('/api/admin/config', {
      body: JSON.stringify(config),
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      }
    });
  }
  _upsertLib(library) {
    fetch('/api/admin/add-library', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(library)
    }).then(this._getConfigData);
  }
  _initLibraries(event) {
    event.preventDefault();
    fetch('/api/admin/init', { method: 'POST' })
      .then(x => x.json())
      .then(console.log)
      .catch(console.log);
  }
  _removeLibrary({ name, location }) {
    const libraries = this.state.config.libraries.filter(
      lib => !(lib.name === name && lib.location === location)
    );
    const config = { ...this.state.config, libraries };

    this._sendConfig(config).then(() => {
      this.setState({ config }, this._getConfigData);
    });
  }
  handleFileUpload({ target: { files, value } }) {
    Promise.all([...files].map(file => {
      var data = new FormData();
      data.append('file', file);

      fetch('/api/upload', {
        method: 'POST',
        body: data
      });
    })).then(() => value = null)
  };
  render() {
    return [
      <Row>
        <Col md="6">
          <h2>Add Libraries</h2>
          <LibraryEdit saveLib={this._upsertLib} />
        </Col>
        <Col md="6">
          <h2>Libraries</h2>
          <ListGroup>
            {this.state.config.libraries.map(
              ({ _id, name, location, created, initialized }) => (
                <ListGroupItem key={_id}>
                  <ListGroupItemHeading>{name}</ListGroupItemHeading>
                  <strong>path: </strong> <code>{location}</code>
                  <Button
                    onClick={() => this._removeLibrary({ name, location })}
                    color="danger"
                    size="sm"
                    className="float-right"
                  >
                    delete
                  </Button>
                </ListGroupItem>
              )
            )}
            <ListGroupItem>
              <Button color="warning" block onClick={this._initLibraries}>
                Initialize All
              </Button>
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Row>,
      <Row>
        <Col md="6">
          <FormGroup>
            <Label for="name">File</Label>
            <input type="file" name="file" ref="file" className="form-control" onChange={(e) => this.handleFileUpload(e)} multiple/>
          </FormGroup>
      </Col>
    </Row>
    ]
  }
}

export default AdminPanel;
