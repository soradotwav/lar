# Logistics Active Resupply (L.A.R)

## Introduction
L.A.R. is an internal tool developed for [Medrunners](https://medrunner.space), and specifically tailored for the logistics department. It enables Medrunners to request equipment on the field or while on standby efficiently. This README outlines the setup, usage, and commands available in L.A.R., focusing on enhancing the logistics operations within the organization.

## Features
- **Resupply Command**: Allows users to request various types of supplies, including medical, ammo, weapon, vehicle, and armor.
- **Refuel Command**: Similar in function to the Resupply command, tailored for refueling operations.
- **Dynamic Request System**: Users can specify the supply type, location, and urgency (Rush T/F) through a streamlined Discord interaction.
- **Automated Logistics Coordination**: The bot facilitates coordination between the client and logistics team, ensuring timely and efficient supply drops.

## Setup
1. Clone the repository to your local machine or server.
2. Install dependencies with `npm install`.
3. Configure the bot token and other necessary settings in a `.env` file.
4. Run the bot using `node .` or a process manager.
5. Configure the roles and channels with the `/settings` command and its subcommands.

## Usage for Rush Orders or during an emergency resupply
### For Team Leads
#### Step 1: Requisition Form
Fill out the provided requisition form in Discord:
- Specify the request type (Refuel/Resupply).
- Choose the supply type needed (Medical, Ammo, Weapon, Vehicle, Armor).
- Provide the location of the request.
- Indicate whether the request is a rush order (True/False).

#### Step 2: Communication
The request in automatically posted in the designated alert channel and open for any logistics member to respond to. Upon responding to a client, the logistic member(s) are to:
- Communicate with the client to take note of the exact location the client is currently at
- Bring all requested supplies to the client in a timely manner

#### Step 3: Coordination
- Ensure that the airspace is clear by having PIL/QRF confirm before LOGI is 1 jump out.
- Coordinate with LOGI to determine a drop spot depending on the operational situation.

### Commands
- `/resupply`: Initiates a resupply request with options to specify details.
- `/refuel`: Initiates a refuel request with options to specify details.
- `/settings`: Used by administrators to adjust L.A.R. settings such as user channel, logistics channel, and roles.

## Contribution
This bot is designed for internal use within the Medrunner organization. Contributions are welcome from organization members to enhance its functionality or address issues. Please submit pull requests or issues through GitHub.

## Support
For support or to report issues, please reach out to the logistics department lead or use the GitHub issue tracker associated with this repository.

---

*Note: This bot is tailored for the Medrunner Star Citizen organization and is not intended for public use outside of its logistics department.*
