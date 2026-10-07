import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Tooltip,
  Button,
  IconButton,
  Badge,
  Drawer,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

import { ExpenseCard } from "../ExpenseCard/ExpenseCard.jsx";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useAllGroups } from "../contexts/AllGroups";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { sortByISODate } from "../utils";
import { Empty } from "antd";
import { useAllUserSettled } from "../contexts/AllUserSettled";
import { useCurrentUser } from "../contexts/CurrentUser";

/** @param {{ targetExpense?: { expenseId: string, requestId: number } | null }} props */
const Expenses = ({ targetExpense }) => {
  const isMobile = useScreenSize();
  const { allGroups } = useAllGroups();
  const { currentGroupID } = useCurrentGroup();
  const currentGroup = allGroups?.find(
    /** @param {{ id?: string }} item */ (item) => item?.id === currentGroupID
  );
  const { allUserSettled } = useAllUserSettled();
  const { currentUser } = useCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentUserEmail = (currentUser?.email || "").toLowerCase();

  const activeFilterCount = [searchTerm, viewFilter !== "all"].filter(Boolean).length;

  const resetFilters = () => {
    setSearchTerm("");
    setViewFilter("all");
  };

  const filteredExpenses = useMemo(() => {
    const expenses = sortByISODate(currentGroup?.expenses || []);

    return expenses.filter(/** @param {any} expense */ (expense) => {
      const description = (expense?.description || "").toLowerCase();
      const paidByName = (expense?.paidBy?.name || "").toLowerCase();
      const paidByEmail = (expense?.paidBy?.email || "").toLowerCase();
      const createdByEmail = (expense?.createdBy?.email || "").toLowerCase();
      const splitEmails = (expense?.splitBetween || [])
        .map(/** @param {any} member */ (member) => (member?.email || "").toLowerCase())
        .filter(Boolean);

      const matchesSearch =
        !searchTerm ||
        description.includes(searchTerm.toLowerCase()) ||
        paidByName.includes(searchTerm.toLowerCase()) ||
        paidByEmail.includes(searchTerm.toLowerCase());

      const matchesView =
        viewFilter === "all" ||
        (viewFilter === "mine" &&
          [paidByEmail, createdByEmail, ...splitEmails].includes(
            currentUserEmail
          )) ||
        (viewFilter === "paid-by-me" && paidByEmail === currentUserEmail) ||
        (viewFilter === "involved" &&
          [paidByEmail, createdByEmail, ...splitEmails].includes(
            currentUserEmail
          ));

      return matchesSearch && matchesView;
    });
  }, [currentGroup?.expenses, currentUserEmail, searchTerm, viewFilter]);

  useEffect(() => {
    if (!targetExpense?.expenseId) return;

    const isVisible = filteredExpenses.some(/** @param {any} expense */ (expense) =>
      String(expense?.id) === String(targetExpense.expenseId)
    );
    if (!isVisible) {
      setSearchTerm("");
      setViewFilter("all");
      return;
    }

    const target = document.getElementById(
      `expense-${encodeURIComponent(String(targetExpense.expenseId))}`
    );
    if (!target) return;

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus({ preventScroll: true });
      target.dataset.navigationTarget = "true";
      window.setTimeout(() => {
        delete target.dataset.navigationTarget;
      }, 1600);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [filteredExpenses, targetExpense]);

  const viewFilterSelect = (
    <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 156 }, flexShrink: 0 }}>
      <Select
        value={viewFilter}
        onChange={(e) => setViewFilter(e.target.value)}
        inputProps={{ "aria-label": "Filter expenses by involvement" }}
        sx={{
          height: 42,
          borderRadius: "10px",
          backgroundColor: "#f7f8fc",
          fontSize: "0.875rem",
          "& fieldset": { borderColor: "transparent" },
          "&:hover fieldset": { borderColor: "rgba(94, 114, 228, 0.35) !important" },
          "&.Mui-focused fieldset": { borderColor: "#5e72e4 !important" },
        }}
      >
        <MenuItem value="all">
          <Tooltip title="All group expenses, regardless of your role." placement="right" arrow>
            <Typography>All expenses</Typography>
          </Tooltip>
        </MenuItem>
        <MenuItem value="mine">
          <Tooltip title="Only expenses where you are the creator or payer." placement="right" arrow>
            <Typography>Mine</Typography>
          </Tooltip>
        </MenuItem>
        <MenuItem value="paid-by-me">
          <Tooltip title="Expenses you paid for and the group owes you back." placement="right" arrow>
            <Typography>Paid by me</Typography>
          </Tooltip>
        </MenuItem>
        <MenuItem value="involved">
          <Tooltip title="Any expense where you are a participant or payer." placement="right" arrow>
            <Typography>Involved</Typography>
          </Tooltip>
        </MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflow: "hidden", // Prevent outer container overflow
      }}
    >
      {/* Compact expense search and filters */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 0.75, sm: 1 },
          p: 0.75,
          flexShrink: 0,
          minWidth: 0,
          border: "1px solid rgba(50, 50, 93, 0.10)",
          borderRadius: "14px",
          backgroundColor: "#fff",
          boxShadow: "0 3px 12px rgba(50, 50, 93, 0.06)",
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search expenses"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            minWidth: 0,
            "& .MuiOutlinedInput-root": {
              height: 42,
              borderRadius: "10px",
              backgroundColor: "#f7f8fc",
              fontSize: "0.875rem",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "rgba(94, 114, 228, 0.35)" },
              "&.Mui-focused fieldset": { borderColor: "#5e72e4" },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "#7b8499", mr: 0.75 }} fontSize="small" />,
          }}
        />
        {!isMobile ? (
          <>
            {viewFilterSelect}
            {activeFilterCount > 0 && (
              <Button size="small" onClick={resetFilters} sx={{ whiteSpace: "nowrap" }}>
                Clear
              </Button>
            )}
          </>
        ) : (
          <Tooltip title="Filter expenses">
            <IconButton
              aria-label={`Filter expenses${viewFilter !== "all" ? ", filter active" : ""}`}
              onClick={() => setFiltersOpen(true)}
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                border: "1px solid",
                borderColor: viewFilter !== "all" ? "rgba(94, 114, 228, 0.35)" : "rgba(50, 50, 93, 0.12)",
                borderRadius: "10px",
                color: viewFilter !== "all" ? "#5e72e4" : "#525f7f",
                backgroundColor: viewFilter !== "all" ? "#f0f2ff" : "#f7f8fc",
                "&:hover": { backgroundColor: "#edf0ff" },
              }}
            >
              <Badge color="primary" variant="dot" invisible={viewFilter === "all"}>
                <FilterListIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}
        <Chip
          label={filteredExpenses.length}
          size="small"
          aria-label={`${filteredExpenses.length} expenses`}
          sx={{
            flexShrink: 0,
            minWidth: 34,
            height: 32,
            borderRadius: "9px",
            backgroundColor: "#f0f2ff",
            color: "#4f60c8",
            fontWeight: 700,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>

      <Drawer
        anchor="bottom"
        open={isMobile && filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: {
            px: 2,
            pt: 2.5,
            pb: "max(16px, env(safe-area-inset-bottom))",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: "0 -8px 32px rgba(50, 50, 93, 0.16)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#32325d">
              Filter expenses
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {filteredExpenses.length} matching expenses
            </Typography>
          </Box>
          <FilterListIcon sx={{ color: "#5e72e4" }} aria-hidden="true" />
        </Box>
        {viewFilterSelect}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5, gap: 1 }}>
          <Button
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            sx={{ minHeight: 44, px: 1.5, color: "#525f7f" }}
          >
            Clear all
          </Button>
          <Button
            variant="contained"
            onClick={() => setFiltersOpen(false)}
            sx={{ minHeight: 44, px: 2.5, borderRadius: "10px", boxShadow: "none" }}
          >
            Show {filteredExpenses.length} expenses
          </Button>
        </Box>
      </Drawer>

      {/* Expenses List - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(94, 114, 228, 0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(94, 114, 228, 0.05)",
            borderRadius: "4px",
          }
        }}
      >
        {filteredExpenses?.map(
          /** @param {any} expense @param {number} index */
          function (expense, index) {
            return (
              <Box
                key={expense?.id || index}
                id={`expense-${encodeURIComponent(String(expense?.id ?? index))}`}
                tabIndex={-1}
                sx={{
                  scrollMargin: 16,
                  outline: "3px solid transparent",
                  outlineOffset: 2,
                  borderRadius: "20px",
                  transition: "outline-color 180ms ease",
                  "&[data-navigation-target='true']": {
                    outlineColor: "rgba(94, 114, 228, 0.55)",
                  },
                }}
              >
                <ExpenseCard
                  groupTitle={currentGroup?.title}
                  groupAdmin={currentGroup?.admin?.email}
                  transaction={{
                    id: expense?.id,
                    paidBy: expense?.paidBy,
                    description: expense?.description,
                    amount: expense?.amount,
                    date: expense?.createdDate,
                    splitBetween: expense?.splitBetween,
                    createdBy: expense?.createdBy,
                    currency: expense?.currency,
                    excludePayer: expense?.excludePayer,
                  }}
                  index={index}
                  groupId={currentGroupID}
                  autoOpen={String(targetExpense?.expenseId) === String(expense?.id)}
                  autoOpenRequestId={targetExpense?.requestId}
                />
              </Box>
            );
          }
        )}
        {filteredExpenses.length <= 0 && (
          <Empty
            style={{ marginTop: 100 }}
            description={
              <Typography variant="subtitle2">No matching expenses</Typography>
            }
          ></Empty>
        )}
        {currentGroup?.expenses?.length <= 0 && filteredExpenses.length <= 0 && (
          <Empty
            style={{ marginTop: 100 }}
            description={
              <Typography variant="subtitle2">No expense, add new</Typography>
            }
          ></Empty>
        )}
      </Box>
    </Box>
  );
};

export default Expenses;
