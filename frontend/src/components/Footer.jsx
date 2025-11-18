import { AppBar, Toolbar, Typography, Stack, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Footer() {
  return (
    <AppBar
      position="fixed"
      sx={{
        top: "auto",
        bottom: 0,
        background: "linear-gradient(90deg, #004d40, #00695c)",
        color: "#fff",
        height: 56,
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          ⚡ IIT Jodhpur — Indoor Mapping System
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2">
            Shubham Raj (M24DE3076)
          </Typography>

          <Link
            href="https://github.com/shubham14p3"
            target="_blank"
            color="inherit"
          >
            <GitHubIcon fontSize="small" />
          </Link>

          <Link
            href="https://linkedin.com/in/shubham14p3"
            target="_blank"
            color="inherit"
          >
            <LinkedInIcon fontSize="small" />
          </Link>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
