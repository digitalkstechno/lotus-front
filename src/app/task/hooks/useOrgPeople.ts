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
      setPeople(allUsers.map((s: any) => ({
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
