import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ---------- Stack ----------
const Stack = createNativeStackNavigator();

// ---------- Hardcoded initial data ----------
// sample users (one will be 'logged-in' after login)
const INITIAL_USERS = [
  {
    id: "u1",
    name: "Ali Khan",
    email: "ali.khan@example.com",
    department: "Computer Science",
    semester: "5",
    avatar: "https://source.unsplash.com/200x200/?face,man",
    password: "1234",
    joinedGroups: [], // group IDs
    sessionsAttended: 0,
  },
  {
    id: "u2",
    name: "Sara Ahmed",
    email: "sara.ahmed@example.com",
    department: "Software Engineering",
    semester: "5",
    avatar: "https://source.unsplash.com/200x200/?face,woman",
    password: "1234",
    joinedGroups: [],
    sessionsAttended: 0,
  },
];

// sample groups
const INITIAL_GROUPS = [
  {
    id: "g1",
    name: "Data Structures Study Group",
    courseName: "Data Structures",
    courseCode: "CS201",
    description: "Weekly DS revision, problem solving and exam prep.",
    topics: ["Trees", "Graphs", "Hashing"],
    maxMembers: 6,
    schedule: "Tue 5:00 PM",
    location: "Library Room A",
    isPrivate: false,
    creatorId: "u1",
    members: ["u1"], // user ids
    pendingRequests: [], // for private groups
    sessions: [], // session IDs
    createdAt: "2025-01-01",
  },
  {
    id: "g2",
    name: "Operating Systems - Labs",
    courseName: "Operating Systems",
    courseCode: "CS301",
    description: "OS lab help and study sessions.",
    topics: ["Processes", "Scheduling"],
    maxMembers: 5,
    schedule: "Fri 3:00 PM",
    location: "Lab 3",
    isPrivate: true,
    creatorId: "u2",
    members: ["u2"],
    pendingRequests: [],
    sessions: [],
    createdAt: "2025-01-05",
  },
];

// sample sessions (linked to groups via groupId)
const INITIAL_SESSIONS = [
  {
    id: "s1",
    groupId: "g1",
    title: "Graphs - Problem Set",
    topic: "Graphs",
    date: "2025-12-14",
    time: "17:00",
    durationMins: 90,
    agenda: "Solve assignment problems and review concepts",
    creatorId: "u1",
    rsvps: {
      // userId: 'Attending'|'Maybe'|'Cannot'
      u1: "Attending",
    },
    canceled: false,
  },
];

// Utility: simple id generator
const id = (prefix = "") =>
  prefix + Math.random().toString(36).slice(2, 9);

// ---------- App Component (provides app-level state) ----------
export default function App() {
  // app-level state
  const [users, setUsers] = useState(INITIAL_USERS);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);

  // authentication: store currentUserId, null if logged out
  const [currentUserId, setCurrentUserId] = useState(null);

  // helpers to get user/group/session by id
  const getUser = (uid) => users.find((u) => u.id === uid);
  const getGroup = (gid) => groups.find((g) => g.id === gid);
  const getSession = (sid) => sessions.find((s) => s.id === sid);

  // auth actions (register/login/logout)
  const register = ({ name, email, password, department, semester, avatar }) => {
    // ensure unique email
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: "Email already registered." };
    }
    const newUser = {
      id: id("u"),
      name,
      email,
      password,
      department,
      semester,
      avatar: avatar || "https://source.unsplash.com/200x200/?face",
      joinedGroups: [],
      sessionsAttended: 0,
    };
    setUsers((p) => [newUser, ...p]);
    setCurrentUserId(newUser.id);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const u = users.find(
      (x) =>
        x.email.toLowerCase() === email.toLowerCase() &&
        x.password === password
    );
    if (!u) {
      return { ok: false, message: "Invalid credentials" };
    }
    setCurrentUserId(u.id);
    return { ok: true, user: u };
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  // Group actions
  const createGroup = (groupData) => {
    const creator = getUser(currentUserId);
    if (!creator) {
      Alert.alert("You must be logged in to create groups.");
      return;
    }
    const newGroup = {
      id: id("g"),
      name: groupData.name,
      courseName: groupData.courseName,
      courseCode: groupData.courseCode,
      description: groupData.description,
      topics: groupData.topics || [],
      maxMembers: Math.max(3, Math.min(10, Number(groupData.maxMembers) || 5)),
      schedule: groupData.schedule,
      location: groupData.location,
      isPrivate: !!groupData.isPrivate,
      creatorId: creator.id,
      members: [creator.id],
      pendingRequests: [],
      sessions: [],
      createdAt: new Date().toISOString(),
    };
    setGroups((p) => [newGroup, ...p]);
    // add to user's joinedGroups
    setUsers((prev) =>
      prev.map((u) =>
        u.id === creator.id ? { ...u, joinedGroups: [...u.joinedGroups, newGroup.id] } : u
      )
    );
    return newGroup;
  };

  const editGroup = (groupId, changes) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...changes } : g))
    );
  };

  const deleteGroup = (groupId) => {
    const g = getGroup(groupId);
    if (!g) return;
    // remove from groups and remove references in users and sessions
    setGroups((prev) => prev.filter((x) => x.id !== groupId));
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        joinedGroups: u.joinedGroups.filter((gid) => gid !== groupId),
      }))
    );
    setSessions((prev) => prev.filter((s) => s.groupId !== groupId));
  };

  const joinGroup = (groupId) => {
    const user = getUser(currentUserId);
    const group = getGroup(groupId);
    if (!user || !group) return { ok: false, message: "Invalid user or group" };
    if (group.members.includes(user.id)) {
      return { ok: false, message: "Already a member" };
    }
    if (group.members.length >= group.maxMembers) {
      return { ok: false, message: "Group is full" };
    }
    if (group.isPrivate) {
      // add to pendingRequests
      editGroup(groupId, { pendingRequests: [...group.pendingRequests, user.id] });
      return { ok: true, message: "Request sent (private group)" };
    } else {
      // public - immediate join
      editGroup(groupId, { members: [...group.members, user.id] });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, joinedGroups: [...u.joinedGroups, groupId] } : u
        )
      );
      return { ok: true, message: "Joined group" };
    }
  };

  const leaveGroup = (groupId) => {
    const user = getUser(currentUserId);
    const group = getGroup(groupId);
    if (!user || !group) return;
    if (!group.members.includes(user.id)) {
      return;
    }
    editGroup(groupId, { members: group.members.filter((m) => m !== user.id) });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, joinedGroups: u.joinedGroups.filter((g) => g !== groupId) } : u
      )
    );
  };

  const approveMember = (groupId, userId) => {
    const group = getGroup(groupId);
    if (!group) return;
    if (group.members.length >= group.maxMembers) {
      Alert.alert("Cannot approve — group full");
      return;
    }
    editGroup(groupId, {
      members: [...group.members, userId],
      pendingRequests: group.pendingRequests.filter((p) => p !== userId),
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, joinedGroups: [...u.joinedGroups, groupId] } : u
      )
    );
  };

  const rejectMember = (groupId, userId) => {
    const group = getGroup(groupId);
    if (!group) return;
    editGroup(groupId, {
      pendingRequests: group.pendingRequests.filter((p) => p !== userId),
    });
  };

  // Session actions
  const createSession = (groupId, sessionData) => {
    const grp = getGroup(groupId);
    if (!grp) {
      Alert.alert("Group not found");
      return null;
    }
    const newSession = {
      id: id("s"),
      groupId,
      title: sessionData.title,
      topic: sessionData.topic,
      date: sessionData.date,
      time: sessionData.time,
      durationMins: Number(sessionData.durationMins) || 60,
      agenda: sessionData.agenda,
      creatorId: currentUserId,
      rsvps: {}, // map of userId -> status
      canceled: false,
    };
    setSessions((p) => [newSession, ...p]);
    editGroup(groupId, { sessions: [newSession.id, ...(grp.sessions || [])] });
    return newSession;
  };

  const rsvpSession = (sessionId, status) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, rsvps: { ...s.rsvps, [currentUserId]: status } } : s
      )
    );
  };

  const cancelSession = (sessionId) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, canceled: true } : s)));
  };

  // Profile edit
  const editProfile = (userId, changes) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...changes } : u)));
  };

  // Stats
  const stats = useMemo(() => {
    const cu = getUser(currentUserId);
    return {
      groupsJoined: cu ? cu.joinedGroups.length : 0,
      sessionsAttended: cu ? cu.sessionsAttended : 0,
    };
  }, [users, currentUserId]);

  // Context props to pass to screens via navigation initialParams or props wrapper
  const appActions = {
    users,
    groups,
    sessions,
    getUser,
    getGroup,
    getSession,
    register,
    login,
    logout,
    currentUserId,
    createGroup,
    editGroup,
    deleteGroup,
    joinGroup,
    leaveGroup,
    approveMember,
    rejectMember,
    createSession,
    rsvpSession,
    cancelSession,
    editProfile,
    stats,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Auth screens */}
        <Stack.Screen name="Welcome" options={{ headerShown: false }}>
          {(props) => <WelcomeScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {(props) => <RegisterScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} app={appActions} />}
        </Stack.Screen>

        {/* Main app */}
        <Stack.Screen name="Dashboard" options={{ title: "Dashboard" }}>
          {(props) => <DashboardScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="GroupsList" options={{ title: "Study Groups" }}>
          {(props) => <GroupsListScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen
          name="GroupDetails"
          options={({ route }) => ({ title: route.params?.group?.name || "Group" })}
        >
          {(props) => <GroupDetailsScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="CreateGroup" options={{ title: "Create Group" }}>
          {(props) => <CreateGroupScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="Profile" options={{ title: "My Profile" }}>
          {(props) => <ProfileScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="CreateSession" options={{ title: "Create Session" }}>
          {(props) => <CreateSessionScreen {...props} app={appActions} />}
        </Stack.Screen>

        <Stack.Screen name="SessionDetails" options={{ title: "Session" }}>
          {(props) => <SessionDetailsScreen {...props} app={appActions} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ---------- Screens ----------

// Welcome - entry screen with Login/Register and quick guest view to groups
function WelcomeScreen({ navigation, app }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Text style={styles.title}>StudyCircle</Text>
        <Text style={styles.subtitle}>Find or create study groups for your courses</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.primaryBtnText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.secondaryBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: 18 }]}
          onPress={() =>
            // guest: if we want a quick guest session, put first user as logged in for demo
            (app.login({ email: app.users[0].email, password: app.users[0].password }), navigation.replace("Dashboard"))
          }
        >
          <Text style={styles.secondaryBtnText}>Quick demo (Login as sample user)</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#555", fontSize: 12, textAlign: "center" }}>
            Note: This is a demo with mocked data. You can register a new user and create groups/sessions.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Register screen
function RegisterScreen({ navigation, app }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    semester: "",
    avatar: "",
  });

  const onRegister = () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Please fill name, email and password");
      return;
    }
    const res = app.register(form);
    if (!res.ok) {
      Alert.alert(res.message || "Registration failed");
    } else {
      navigation.replace("Dashboard");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h2}>Register</Text>

        <Input label="Full Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
        <Input label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
        <Input label="Password" value={form.password} secureTextEntry onChangeText={(t) => setForm({ ...form, password: t })} />
        <Input label="Department" value={form.department} onChangeText={(t) => setForm({ ...form, department: t })} />
        <Input label="Semester/Year" value={form.semester} onChangeText={(t) => setForm({ ...form, semester: t })} />
        <Input label="Avatar URL (optional)" value={form.avatar} onChangeText={(t) => setForm({ ...form, avatar: t })} />

        <TouchableOpacity style={styles.primaryBtn} onPress={onRegister}>
          <Text style={styles.primaryBtnText}>Create Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Login screen
function LoginScreen({ navigation, app }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const onLogin = () => {
    if (!form.email || !form.password) {
      Alert.alert("Enter credentials");
      return;
    }
    const res = app.login(form);
    if (!res.ok) {
      Alert.alert(res.message || "Login failed");
      return;
    }
    navigation.replace("Dashboard");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ padding: 16 }}>
        <Text style={styles.h2}>Login</Text>
        <Input label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
        <Input label="Password" value={form.password} secureTextEntry onChangeText={(t) => setForm({ ...form, password: t })} />

        <TouchableOpacity style={styles.primaryBtn} onPress={onLogin}>
          <Text style={styles.primaryBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Dashboard screen - shows joined groups, upcoming sessions and quick stats
function DashboardScreen({ navigation, app }) {
  const user = app.getUser(app.currentUserId);
  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Please login</Text>
        </View>
      </SafeAreaView>
    );
  }

  // upcoming sessions this week (naive: show sessions for next 7 days)
  const upcoming = app.sessions
    .filter((s) => !s.canceled)
    .filter((s) => {
      // for demo keep any session with date >= today (simple)
      try {
        const d = new Date(s.date);
        return d >= new Date();
      } catch {
        return true;
      }
    })
    .slice(0, 6);

  const myGroups = app.groups.filter((g) => g.members.includes(user.id));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.rowSpace}>
          <View>
            <Text style={styles.h2}>Welcome, {user.name}</Text>
            <Text style={{ color: "#666" }}>{user.department} • Sem {user.semester}</Text>
          </View>
          <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate("Profile")}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style={{ fontSize: 12, marginTop: 6, color: "#007bff" }}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Your Active Groups</Text>
          {myGroups.length === 0 ? (
            <Text style={{ color: "#666", marginTop: 8 }}>You have not joined any groups yet.</Text>
          ) : (
            myGroups.map((g) => (
              <TouchableOpacity key={g.id} style={styles.cardAlt} onPress={() => navigation.navigate("GroupDetails", { group: g })}>
                <Text style={{ fontWeight: "700" }}>{g.name}</Text>
                <Text style={{ color: "#666", marginTop: 4 }}>{g.courseName} • {g.schedule}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          <View style={styles.rowSpace}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => navigation.navigate("GroupsList")}>
              <Text style={{ color: "#007bff" }}>Browse Groups</Text>
            </TouchableOpacity>
          </View>

          {upcoming.length === 0 ? (
            <Text style={{ color: "#666", marginTop: 8 }}>No upcoming sessions.</Text>
          ) : (
            upcoming.map((s) => {
              const g = app.getGroup(s.groupId);
              return (
                <TouchableOpacity key={s.id} style={styles.cardAlt} onPress={() => navigation.navigate("SessionDetails", { sessionId: s.id })}>
                  <Text style={{ fontWeight: "700" }}>{s.title}</Text>
                  <Text style={{ color: "#666", marginTop: 4 }}>{g?.name} • {s.date} {s.time}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.joinedGroups.length}</Text>
              <Text style={styles.statLabel}>Groups Joined</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{user.sessionsAttended || 0}</Text>
              <Text style={styles.statLabel}>Sessions Attended</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("GroupsList")}>
              <Text style={{ color: "#007bff" }}>Browse Groups</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, { marginLeft: 8 }]} onPress={() => navigation.navigate("CreateGroup")}>
              <Text style={{ color: "#007bff" }}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Groups list with search and simple filters
function GroupsListScreen({ navigation, app }) {
  const [q, setQ] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // filtered groups
  const filtered = app.groups.filter((g) => {
    if (q && !(`${g.name} ${g.courseName} ${g.courseCode} ${g.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (filterCourse && !g.courseName.toLowerCase().includes(filterCourse.toLowerCase())) return false;
    // we don't have group department field; a filterDept would require matching creator's department; skip complexity
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ padding: 12 }}>
        <TextInput placeholder="Search groups, courses, topics..." value={q} onChangeText={setQ} style={styles.input} />
        <TextInput placeholder="Filter by course (optional)" value={filterCourse} onChangeText={setFilterCourse} style={styles.input} />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          style={{ marginTop: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("GroupDetails", { group: item })}>
              <Text style={{ fontWeight: "700" }}>{item.name}</Text>
              <Text style={{ color: "#666", marginTop: 6 }}>{item.courseName} ({item.courseCode}) • {item.schedule}</Text>
              <Text style={{ color: "#444", marginTop: 6 }}>{item.members.length} members • {item.isPrivate ? "Private" : "Public"}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ color: "#666", marginTop: 12 }}>No groups found</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

// Group details (shows info, members, join/leave, approve requests, sessions)
function GroupDetailsScreen({ route, navigation, app }) {
  // route.params.group: may be object
  const groupFromRoute = route.params?.group;
  const group = app.getGroup(groupFromRoute?.id) || groupFromRoute;
  if (!group) return <Empty message="Group not found" />;

  const user = app.getUser(app.currentUserId);
  const isCreator = user && group.creatorId === user.id;
  const isMember = user && group.members.includes(user.id);
  const hasPending = user && group.pendingRequests.includes(user.id);

  const onJoin = () => {
    const res = app.joinGroup(group.id);
    if (!res.ok) {
      Alert.alert(res.message || "Cannot join");
    } else {
      Alert.alert(res.message || "Joined or requested");
    }
  };

  const onLeave = () => {
    Alert.alert("Leave group?", "Are you sure you want to leave this group?", [
      { text: "Cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          app.leaveGroup(group.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const onDelete = () => {
    Alert.alert("Delete group?", "This will remove the group and all sessions.", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          app.deleteGroup(group.id);
          navigation.navigate("GroupsList");
        },
      },
    ]);
  };

  // helper to open create session
  const openCreateSession = () => {
    navigation.navigate("CreateSession", { groupId: group.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h2}>{group.name}</Text>
        <Text style={{ color: "#666" }}>{group.courseName} • {group.courseCode}</Text>
        <Text style={{ marginTop: 8 }}>{group.description}</Text>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700" }}>Topics</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {group.topics.map((t, i) => (
              <View key={i} style={{ padding: 8, backgroundColor: "#eef2ff", borderRadius: 8, marginRight: 8, marginBottom: 8 }}>
                <Text>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700" }}>Details</Text>
          <Text style={{ color: "#666", marginTop: 6 }}>{group.schedule} • {group.location}</Text>
          <Text style={{ color: "#666", marginTop: 6 }}>Max members: {group.maxMembers}</Text>
          <Text style={{ color: "#666", marginTop: 6 }}>Visibility: {group.isPrivate ? "Private (approval needed)" : "Public (join instantly)"}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700" }}>Members ({group.members.length})</Text>
          {group.members.map((mid) => {
            const m = app.getUser(mid);
            return (
              <View key={mid} style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
                <Image source={{ uri: m?.avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                <Text style={{ fontWeight: "600" }}>{m?.name}</Text>
                {group.creatorId === mid && <Text style={{ marginLeft: 8, color: "#007bff" }}>(Creator)</Text>}
              </View>
            );
          })}
        </View>

        {isCreator && group.pendingRequests.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "700" }}>Pending Requests</Text>
            {group.pendingRequests.map((pid) => {
              const r = app.getUser(pid);
              return (
                <View key={pid} style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ flex: 1 }}>{r?.name} ({r?.department})</Text>
                  <TouchableOpacity style={styles.smallAction} onPress={() => app.approveMember(group.id, pid)}>
                    <Text style={{ color: "#fff" }}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.smallAction, { backgroundColor: "#ccc", marginLeft: 8 }]} onPress={() => app.rejectMember(group.id, pid)}>
                    <Text>Reject</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ marginTop: 16 }}>
          {!isMember ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={onJoin}>
              <Text style={styles.primaryBtnText}>{group.isPrivate ? (hasPending ? "Request Sent" : "Request to Join") : "Join Group"}</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1 }]} onPress={() => navigation.navigate("CreateSession", { groupId: group.id })}>
                <Text style={styles.secondaryBtnText}>Create Session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryBtn, { flex: 1, marginLeft: 8 }]} onPress={onLeave}>
                <Text style={styles.secondaryBtnText}>Leave Group</Text>
              </TouchableOpacity>
            </View>
          )}

          {isCreator && (
            <View style={{ marginTop: 8, flexDirection: "row" }}>
              <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: "#ffdddd", borderColor: "#ff6b6b", borderWidth: 1, flex: 1 }]} onPress={onDelete}>
                <Text style={{ color: "#c00", textAlign: "center" }}>Delete Group</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Scheduled Sessions</Text>
          {group.sessions.length === 0 ? (
            <Text style={{ color: "#666", marginTop: 8 }}>No sessions scheduled.</Text>
          ) : (
            group.sessions.map((sid) => {
              const s = app.getSession(sid);
              if (!s) return null;
              return (
                <TouchableOpacity key={sid} style={styles.cardAlt} onPress={() => navigation.navigate("SessionDetails", { sessionId: s.id })}>
                  <Text style={{ fontWeight: "700" }}>{s.title}{s.canceled ? " (Canceled)" : ""}</Text>
                  <Text style={{ color: "#666", marginTop: 4 }}>{s.date} • {s.time} • {s.topic}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// CreateGroup - simple form
function CreateGroupScreen({ navigation, app }) {
  const [form, setForm] = useState({
    name: "",
    courseName: "",
    courseCode: "",
    description: "",
    topics: "",
    maxMembers: "5",
    schedule: "",
    location: "",
    isPrivate: false,
  });

  const onCreate = () => {
    if (!form.name || !form.courseName) {
      Alert.alert("Please enter group name and course name");
      return;
    }
    const newGroup = app.createGroup({
      ...form,
      topics: form.topics ? form.topics.split(",").map((t) => t.trim()) : [],
      isPrivate: form.isPrivate,
    });
    if (newGroup) {
      navigation.navigate("GroupDetails", { group: newGroup });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h2}>Create Study Group</Text>

        <Input label="Group Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
        <Input label="Course Name" value={form.courseName} onChangeText={(t) => setForm({ ...form, courseName: t })} />
        <Input label="Course Code" value={form.courseCode} onChangeText={(t) => setForm({ ...form, courseCode: t })} />
        <Input label="Description" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline />
        <Input label="Topics (comma separated)" value={form.topics} onChangeText={(t) => setForm({ ...form, topics: t })} />
        <Input label="Max Members (3-10)" value={form.maxMembers} onChangeText={(t) => setForm({ ...form, maxMembers: t })} keyboardType="numeric" />
        <Input label="Schedule (e.g., Tue 5:00 PM)" value={form.schedule} onChangeText={(t) => setForm({ ...form, schedule: t })} />
        <Input label="Location" value={form.location} onChangeText={(t) => setForm({ ...form, location: t })} />

        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
          <TouchableOpacity onPress={() => setForm({ ...form, isPrivate: !form.isPrivate })} style={{ marginRight: 12 }}>
            <View style={{ width: 22, height: 22, borderRadius: 4, borderWidth: 1, backgroundColor: form.isPrivate ? "#007bff" : "#fff" }} />
          </TouchableOpacity>
          <Text>Private group (requires approval)</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onCreate}>
          <Text style={styles.primaryBtnText}>Create Group</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// CreateSession - creates a session for the group
function CreateSessionScreen({ route, navigation, app }) {
  const groupId = route.params?.groupId;
  const group = app.getGroup(groupId);
  const [form, setForm] = useState({
    title: "",
    topic: "",
    date: "",
    time: "",
    durationMins: "60",
    agenda: "",
  });

  const onCreate = () => {
    if (!form.title || !form.date || !form.time) {
      Alert.alert("Provide title, date and time");
      return;
    }
    const s = app.createSession(groupId, form);
    if (s) {
      navigation.navigate("GroupDetails", { group: group });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h2}>Create Session for {group?.name}</Text>
        <Input label="Title" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
        <Input label="Topic" value={form.topic} onChangeText={(t) => setForm({ ...form, topic: t })} />
        <Input label="Date (YYYY-MM-DD)" value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} />
        <Input label="Time (HH:MM)" value={form.time} onChangeText={(t) => setForm({ ...form, time: t })} />
        <Input label="Duration (mins)" value={form.durationMins} onChangeText={(t) => setForm({ ...form, durationMins: t })} keyboardType="numeric" />
        <Input label="Agenda" value={form.agenda} onChangeText={(t) => setForm({ ...form, agenda: t })} multiline />
        <TouchableOpacity style={styles.primaryBtn} onPress={onCreate}>
          <Text style={styles.primaryBtnText}>Schedule Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Session Details - RSVP, cancel (if creator)
function SessionDetailsScreen({ route, navigation, app }) {
  const sessionId = route.params?.sessionId;
  const session = app.getSession(sessionId);
  if (!session) return <Empty message="Session not found" />;
  const group = app.getGroup(session.groupId);
  const user = app.getUser(app.currentUserId);
  const myRsvp = session.rsvps?.[user?.id] || "None";

  const setRsvpLocal = (status) => {
    app.rsvpSession(session.id, status);
    Alert.alert("RSVP updated", `You marked: ${status}`);
  };

  const onCancel = () => {
    if (session.creatorId !== user.id) {
      Alert.alert("Only creator can cancel this session");
      return;
    }
    Alert.alert("Cancel session?", "Are you sure?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: () => {
          app.cancelSession(session.id);
          navigation.navigate("GroupDetails", { group });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h2}>{session.title}</Text>
        <Text style={{ color: "#666" }}>{group?.name} • {session.date} {session.time}</Text>
        {session.canceled && <Text style={{ color: "#c00", marginTop: 8 }}>Canceled</Text>}
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700" }}>Agenda</Text>
          <Text style={{ marginTop: 6 }}>{session.agenda}</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "700" }}>RSVP</Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity style={styles.smallAction} onPress={() => setRsvpLocal("Attending")}><Text style={{ color: "#fff" }}>Attending</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.smallAction, { backgroundColor: "#f0ad4e", marginLeft: 8 }]} onPress={() => setRsvpLocal("Maybe")}><Text style={{ color: "#fff" }}>Maybe</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.smallAction, { backgroundColor: "#ccc", marginLeft: 8 }]} onPress={() => setRsvpLocal("Cannot")}><Text>Cannot</Text></TouchableOpacity>
          </View>
          <Text style={{ marginTop: 8 }}>Your RSVP: {myRsvp}</Text>
        </View>

        {session.creatorId === user.id && (
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: "#ffdddd", borderColor: "#ff6b6b", borderWidth: 1 }]} onPress={onCancel}>
              <Text style={{ color: "#c00" }}>Cancel Session</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: "700" }}>Attendees</Text>
          {Object.keys(session.rsvps || {}).length === 0 ? (
            <Text style={{ color: "#666", marginTop: 8 }}>No RSVPs yet</Text>
          ) : (
            Object.entries(session.rsvps).map(([uid, status]) => {
              const u = app.getUser(uid);
              return (
                <View key={uid} style={{ marginTop: 8 }}>
                  <Text>{u?.name} — {status}</Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Profile screen allows editing profile and logout
function ProfileScreen({ navigation, app }) {
  const user = app.getUser(app.currentUserId);
  const [form, setForm] = useState({ name: user.name, email: user.email, department: user.department, semester: user.semester, avatar: user.avatar });

  const save = () => {
    app.editProfile(user.id, form);
    Alert.alert("Profile updated");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.h2}>My Profile</Text>
        <Image source={{ uri: user.avatar }} style={{ width: 100, height: 100, borderRadius: 50, marginTop: 8 }} />
        <Input label="Full name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
        <Input label="Email" value={form.email} onChangeText={(t) => setForm({ ...form, email: t })} keyboardType="email-address" />
        <Input label="Department" value={form.department} onChangeText={(t) => setForm({ ...form, department: t })} />
        <Input label="Semester" value={form.semester} onChangeText={(t) => setForm({ ...form, semester: t })} />
        <Input label="Avatar URL" value={form.avatar} onChangeText={(t) => setForm({ ...form, avatar: t })} />

        <TouchableOpacity style={styles.primaryBtn} onPress={save}>
          <Text style={styles.primaryBtnText}>Save Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 12 }]} onPress={() => { app.logout(); navigation.replace("Welcome"); }}>
          <Text style={styles.secondaryBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Small UI components ----------
const Input = ({ label, ...props }) => (
  <View style={{ marginTop: 12 }}>
    {label && <Text style={{ fontWeight: "600", marginBottom: 6 }}>{label}</Text>}
    <TextInput {...props} style={styles.input} />
  </View>
);

const Empty = ({ message }) => (
  <SafeAreaView style={styles.safe}>
    <View style={styles.center}>
      <Text>{message}</Text>
    </View>
  </SafeAreaView>
);

// ---------- Styles ----------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 32, fontWeight: "800", color: "#0b69ff" },
  subtitle: { marginTop: 8, color: "#444" },
  h2: { fontSize: 20, fontWeight: "800" },
  input: { backgroundColor: "#fff", padding: Platform.OS === "ios" ? 12 : 8, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" },
  primaryBtn: { marginTop: 12, padding: 12, backgroundColor: "#0b69ff", borderRadius: 8, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: { marginTop: 12, padding: 10, backgroundColor: "#fff", borderColor: "#e5e7eb", borderWidth: 1, borderRadius: 8, alignItems: "center" },
  secondaryBtnText: { color: "#333", fontWeight: "600" },
  smallBtn: { alignItems: "center" },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: "#eef2ff" },
  cardAlt: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  sectionTitle: { fontWeight: "800", fontSize: 16 },
  rowSpace: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  statBox: { flex: 1, backgroundColor: "#fff", padding: 12, marginRight: 8, borderRadius: 8, borderWidth: 1, borderColor: "#e6eefc" },
  statsRow: { flexDirection: "row", marginTop: 10 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { color: "#666", marginTop: 4 },
  actionBtn: { padding: 12, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  smallAction: { padding: 8, backgroundColor: "#0b69ff", borderRadius: 6 },
});

