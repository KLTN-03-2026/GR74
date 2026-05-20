import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { postDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Passwords do not match." } });
    }

    try {
      const res = await postDataAPI("reset_password", { token, password });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
      navigate("/");
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    }
  };

  return (
    <div className="auth_page">
      <form onSubmit={handleSubmit}>
        <h3 className="text-uppercase text-center mb-4">Create New Password</h3>

        <div className="form-group">
          <label>New password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm password</label>
          <input
            type="password"
            className="form-control"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button className="btn btn-dark w-100" disabled={!password || !confirm}>
          Reset password
        </button>
        <p className="my-2"><Link to="/" className="auth_link">Back to login</Link></p>
      </form>
    </div>
  );
};

export default ResetPassword;
