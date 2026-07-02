import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Stack,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";

import ExpenseCard from "../ExpenseCard/ExpenseCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useAllGroups } from "../contexts/AllGroups";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { sortByISODate } from "../utils";
import { Empty } from "antd";
import { useAllUserSettled } from "../contexts/AllUserSettled";
import { useCurrentUser } from "../contexts/CurrentUser";

const Expenses = () => {
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
      {/* Filter Section - Fixed at top */}
      <Box sx={{ flexShrink: 0 }}>
        <Accordion
          disableGutters
          elevation={0}
          defaultExpanded={false}
          sx={{
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(94, 114, 228, 0.09), rgba(255,255,255,0.95))",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            overflow: "hidden",
            border: "1px solid rgba(94, 114, 228, 0.12)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#5e72e4", fontSize: 20 }} />}
            sx={{
              minHeight: 40,
              px: 1,
              py: 0.5,
              "& .MuiAccordionSummary-content": {
                margin: "4px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                gap: 1,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterListIcon sx={{ color: "#5e72e4" }} />
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                  Filters
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  Narrow by search or view
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${activeFilterCount} active`}
              size="small"
              sx={{ backgroundColor: "rgba(94, 114, 228, 0.12)", color: "#5e72e4", fontWeight: 600 }}
            />
          </AccordionSummary>

          <AccordionDetails sx={{ px: 1.25, pb: 1.25, pt: 0.5 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 1.25,
                borderRadius: 3,
                background: "rgba(255,255,255,0.95)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "flex-end" },
                  gap: 1,
                  width: "100%",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search expenses"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: "#94a3b8", mr: 0.75 }} fontSize="small" />,
                  }}
                  sx={{ flex: 1, minWidth: { xs: "100%", md: 320 } }}
                />

                <FormControl
                  size="small"
                  sx={{
                    minWidth: 160,
                    '& .MuiSelect-select': {
                      minHeight: 40,
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                >
                  <Select
                    value={viewFilter}
                    onChange={(e) => setViewFilter(e.target.value)}
                    sx={{ minHeight: 40 }}
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
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.25, flexWrap: "wrap", gap: 1 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <Chip label={`Showing ${filteredExpenses.length} expense(s)`} size="small" />
                  {searchTerm && <Chip label={`Search: ${searchTerm}`} size="small" onDelete={() => setSearchTerm("")} />}
                  {viewFilter !== "all" && (
                    <Chip
                      label={`View: ${viewFilter.replace(/-/g, " ")}`}
                      size="small"
                      onDelete={() => setViewFilter("all")}
                    />
                  )}
                </Stack>

                <Button size="small" variant="outlined" onClick={resetFilters} sx={{ borderRadius: 999 }}>
                  Clear filters
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>

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
              <ExpenseCard
                key={expense?.id || index}
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
              />
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
