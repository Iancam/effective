import React, { Component } from 'react';
import '../SignUpLogInModal.css';
import './SignUp.css';
import { getUsers, postUser } from '../../../actions';
import { connect } from 'react-redux';
class SignUp extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    username: '',
    password: ''
  };

  handleSubmit = e => {
    e.preventDefault();
    // TODO: Front End Validation
    // Post Request SignUp
    // Clear user info from RAM

    const end = { username: this.state.username };
    console.log(end);

    this.props.postUser(end);
  };

  handleChange = e => {
    this.setState({ [e.target.id.split('-')[1]]: e.target.value });
  };

  render() {
    return (
      <div
        className="modal fade"
        id="sign-up-modal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="myModalLabel"
      >
        <div className="modal-dialog sign-login-dialog" role="document">
          <div className="modal-content signup-login-content">
            <div className="modal-header">
              <button
                className="close"
                type="button"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title sign-login-title">Sign Up</h4>
            </div>
            <div className="modal-body signup-login-body">
              <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label
                    className="col-sm-2 control-label signup-login-label"
                    htmlFor="input-username-signup"
                  >
                    Username
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="text"
                      className="form-control"
                      id="input-username-signup"
                      placeholder="Username"
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label
                    className="col-sm-2 control-label signup-login-label"
                    htmlFor="input-password-signup"
                  >
                    Password
                  </label>
                  <div className="col-sm-10">
                    <input
                      type="password"
                      className="form-control"
                      id="input-password-signup"
                      placeholder=""
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                <div className="form-group modal-btn-ctn">
                  <button
                    className="btn btn-default btn-close"
                    type="button"
                    data-dismiss="modal"
                  >
                    Close
                  </button>
                  <button className="btn btn-primary" type="submit">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
connect;
export default connect(
  ({ users }) => ({
    users
  }),
  { getUsers, postUser }
)(SignUp);
