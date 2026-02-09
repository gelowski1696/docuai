# 🚀 DocuAI - Easy Setup for Non-Technical Users

## What You'll Need

1. **Docker Desktop** - Download from: https://www.docker.com/products/docker-desktop
2. **This project folder** - Copy the entire folder to the target computer

## Step-by-Step Setup

### Step 1: Install Docker Desktop (One-Time Setup)

1. Download Docker Desktop from the link above
2. Run the installer
3. **Restart your computer** after installation
4. Start Docker Desktop (look for the whale icon in your system tray)
5. Wait until Docker Desktop shows "Running" status

### Step 2: Run DocuAI

**Simply double-click:** `START-DOCUAI.bat`

That's it! The script will:
- ✅ Check if Docker is installed
- ✅ Check if Docker is running
- ✅ Build and start the application
- ✅ Wait for it to be ready
- ✅ Automatically open your browser

### Step 3: Login

The browser will open automatically to `http://localhost:3000`

**Login with:**
- Email: `admin@docuai.com`
- Password: `admin123`

## Other Useful Scripts

### Stop the Application
Double-click: `STOP-DOCUAI.bat`

### View Application Logs
Double-click: `VIEW-LOGS.bat`

### Restart the Application
1. Double-click `STOP-DOCUAI.bat`
2. Double-click `START-DOCUAI.bat`

## Troubleshooting

### "Docker is not installed" Error

**Solution:**
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Restart your computer
3. Run `START-DOCUAI.bat` again

### "Docker is not running" Error

**Solution:**
1. Look for the Docker whale icon in your system tray (bottom-right corner)
2. If you don't see it, search for "Docker Desktop" in Windows and start it
3. Wait until Docker Desktop shows "Running"
4. Run `START-DOCUAI.bat` again

### Application Won't Open in Browser

**Solution:**
1. Wait 1-2 minutes (first-time setup takes longer)
2. Manually open browser and go to: `http://localhost:3000`
3. If still not working, run `VIEW-LOGS.bat` to see what's happening

### Port 3000 Already in Use

**Solution:**
1. Close any other applications using port 3000
2. Or edit `docker-compose.yml` and change `"3000:3000"` to `"8080:3000"`
3. Then access at `http://localhost:8080`

### Can't Login

**Solution:**
1. Run `STOP-DOCUAI.bat`
2. Delete the Docker volume: `docker volume rm docuai-data`
3. Run `START-DOCUAI.bat` again

## What Happens Behind the Scenes?

When you run `START-DOCUAI.bat`:

1. **Checks Docker** - Makes sure Docker is installed and running
2. **Cleans up** - Removes any old containers
3. **Builds** - Creates a Docker image with your application
4. **Starts** - Launches the container with SQLite database
5. **Initializes** - Creates database and admin account automatically
6. **Opens Browser** - Takes you to the login page

All your data is stored in a Docker volume, so it persists even if you stop and restart the application.

## Remote Access (Optional)

If you want to access DocuAI from other computers on your network:

1. Find your computer's IP address:
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Access from other computers:
   - Open browser
   - Go to: `http://YOUR-IP-ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

## Need Help?

- **View Logs**: Run `VIEW-LOGS.bat` to see what's happening
- **Fresh Start**: Run `STOP-DOCUAI.bat`, then delete Docker volume, then run `START-DOCUAI.bat`
- **Docker Status**: Open Docker Desktop to see container status

---

**Remember:** Keep Docker Desktop running while using DocuAI!
