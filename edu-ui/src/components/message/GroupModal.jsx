import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getDataAPI } from "../../utils/fetchData";
import { GLOBALTYPES } from "../../redux/actions/globalTypes";
import { createGroup } from "../../redux/actions/messageAction";
import Avatar from "../Avatar";
import { getErrorMessage } from "../../utils/errorMessage";

const GroupModal = ({ onClose }) => {
  const { auth, socket } = useSelector((state) => state);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) return setUsers([]);

    const friends = auth.user.friends || [];
    const searchResults = friends.filter((friend) => 
      friend.username.toLowerCase().includes(value.toLowerCase()) ||
      (friend.fullname && friend.fullname.toLowerCase().includes(value.toLowerCase()))
    );
    setUsers(searchResults);
  };

  const toggleUser = (user) => {
    setSelected((current) => current.find((item) => item._id === user._id)
      ? current.filter((item) => item._id !== user._id)
      : [...current, user]);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const group = await dispatch(createGroup({
      name,
      recipients: selected.map((user) => user._id),
      auth,
      socket,
    }));
    setLoading(false);

    if (group) {
      onClose();
      navigate(`/message/${group._id}`);
    }
  };

  return (
    <div className="group_modal">
      <form className="group_box" onSubmit={handleCreate}>
        <div className="group_head">
          <h5>Create group</h5>
          <button type="button" onClick={onClose}>&times;</button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="group_input"
        />

        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search friends to add"
          className="group_input"
        />

        <div className="group_selected">
          {selected.map((user) => (
            <span key={user._id}>
              {user.username}
              <button type="button" onClick={() => toggleUser(user)}>x</button>
            </span>
          ))}
        </div>

        <div className="group_users">
          {users.map((user) => (
            <button
              type="button"
              key={user._id}
              className={selected.find((item) => item._id === user._id) ? "active" : ""}
              onClick={() => toggleUser(user)}
            >
              <Avatar src={user.avatar} size="medium-avatar" />
              <span>{user.username}</span>
            </button>
          ))}
        </div>

        <button className="group_create_btn" disabled={loading || selected.length < 2 || !name.trim()}>
          {loading ? "Creating..." : "Create group"}
        </button>
      </form>
    </div>
  );
};

export default GroupModal;
