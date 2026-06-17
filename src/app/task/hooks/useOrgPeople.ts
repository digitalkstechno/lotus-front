import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchUsersDropdownApi } from "../../../services/userService";

export function useOrgPeople() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const authUser = useSelector((state: any) => state.auth.user);

  const fetchPeople = async () => {
    if (!authUser) return;
    if (people.length > 0) return; // already fetched
    
    setLoading(true);
    try {
      const res = await fetchUsersDropdownApi();
      const allUsers = res.data?.data || [];
      let filtered = [];

      const userRole = authUser.role ? authUser.role.toLowerCase() : "";

      if (userRole === "admin") {
        filtered = allUsers;
      } else if (userRole === "unit_head") {
        filtered = allUsers.filter((u: any) => u.unit_id === authUser.unit_id);
      } else if (userRole === "team_head") {
        filtered = allUsers.filter((u: any) => u.team_id === authUser.team_id);
      } else {
        filtered = allUsers.filter((u: any) => 
          (u._id && authUser._id && u._id === authUser._id) || 
          (u.id && authUser.id && u.id === authUser.id) ||
          (u._id === authUser.id) || (u.id === authUser._id)
        );
      }

      setPeople(filtered.map((s: any) => ({
        id: s._id,
        name: s.fullName,
        role: s.role?.toLowerCase() === "unit_head" ? "Unit Head" : s.role?.toLowerCase() === "team_head" ? "Team Head" : s.role?.toLowerCase() === "admin" ? "Admin" : "Staff",
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { people, fetchPeople, loading };
}
