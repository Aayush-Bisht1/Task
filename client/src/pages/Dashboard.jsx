import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [sentrequest, setSentRequest] = useState([]);
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(response.data.user);
      const sentRequestIds = response.data.user.sentFriendRequests || [];
      setSentRequest(sentRequestIds);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/friends/recommendations",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRecommendations(response.data.recommendations);
    } catch (error) {
      console.log(error);
    }
  };
  const handleAddFriend = async (friendId) => {
    try {
      setSentRequest((prev) => [...prev, friendId]);
      const response = await axios.post(
        `http://localhost:5000/api/friends/request/${friendId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.success) {
        setSentRequest((prev) => [...prev, friendId]);
        await fetchUser();
        await fetchRecommendations();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFriendRequest = async (requestId, action) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/friends/request/${requestId}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success) {
        await fetchUser();
        await fetchRecommendations();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="w-full bg-blue-300 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-4xl font-extrabold text-pink-500 hover:text-pink-600 transition-colors">
                [#]SOCIALS
              </h1>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-6">
              {user && (
                <>
                  <div className="hidden md:flex items-center space-x-4">
                    <Avatar className="h-11 w-11 border-2 border-white">
                      <img
                        src={user.profileImage}
                        alt="profile"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </Avatar>
                    <span className="text-gray-700 font-semibold text-lg">
                      {user.username.toUpperCase()}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-gray-900 hover:bg-blue-200 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-8 w-8" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6 flex gap-2">
        <Card className="hidden md:block p-6 max-h-screen w-1/4">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Friends</h2>
          <div className="space-y-2">
            {user?.friendRequest?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-500 mb-2">
                  Friend Requests
                </h3>
                {user.friendRequest.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <img
                          src={
                            request.from.profileImage ||
                            "/placeholder-avatar.png"
                          }
                          alt={request.from.username}
                        />
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">
                        {request.from.username.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleFriendRequest(request._id, "accept")
                        }
                        className="text-green-500 hover:bg-green-100 hover:text-green-600"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleFriendRequest(request._id, "reject")
                        }
                        className="text-red-500 hover:bg-red-100 hover:text-red-600"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user?.friends?.length === 0 ? (
              <div className="text-center text-red-400">No friends yet</div>
            ) : (
              user?.friends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <img
                        src={friend.profileImage || "/placeholder-avatar.png"}
                        alt={friend.username}
                      />
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">
                      {friend.username.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 h-[calc(100vh-12rem)] w-full ">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {recommendations.map((friend) => (
              <div key={friend._id} className="p-2 border rounded-lg">
                <img
                  src={friend?.profileImage}
                  className="w-full aspect-[2/1] rounded-lg"
                />
                <div className="flex items-center justify-between space-x-2">
                  <h3 className="font-semibold text-lg mt-1">
                    {friend?.username?.toUpperCase()}
                  </h3>
                  <Badge className="bg-red-400 text-center hover:bg-red-500">
                    {friend.mutualFriendsCount} mutual friend
                    {friend.mutualFriendsCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-md text-gray-500">
                  <div>
                    <p>Age: {friend.age}</p>
                    <p>Gender: {friend.gender.toUpperCase()}</p>
                  </div>
                  <div>
                    <p>Total Friends: {friend.friends.length}</p>
                    <p>Location: {friend.location}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1 mt-1">
                  <Badge className="self-start bg-slate-500 text-center">
                    {friend?.interest}
                  </Badge>
                  <Button
                    className="bg-red-400 transition-all duration-300 hover:bg-red-500"
                    onClick={() => handleAddFriend(friend._id)}
                    disabled={sentrequest.includes(friend._id.toString())}
                  >
                    {sentrequest.includes(friend._id.toString())
                      ? "Request Sent"
                      : "Add Friend +"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
