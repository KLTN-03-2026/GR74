import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { patchDataAPI } from "../utils/fetchData";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { getErrorMessage } from "../utils/errorMessage";

const ChangePassword = () => {
  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return dispatch({ type: GLOBALTYPES.ALERT, payload: { error: "Passwords do not match." } });
    }

    try {
      const res = await patchDataAPI("change_password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, auth.token);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      dispatch({ type: GLOBALTYPES.ALERT, payload: { success: res.data.msg } });
    } catch (err) {
      dispatch({ type: GLOBALTYPES.ALERT, payload: { error: getErrorMessage(err) } });
    }
  };

  return (
    <main className="settings_page">
      <form className="settings_card" onSubmit={handleSubmit}>
        <p>Security</p>
        <h1>Change password</h1>

        <label>Current password</label>
        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} />

        <label>New password</label>
        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />

        <label>Confirm new password</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

        <button disabled={!form.currentPassword || !form.newPassword || !form.confirmPassword}>
          Update password
        </button>
      </form>
    </main>
  );
};

export default ChangePassword;
