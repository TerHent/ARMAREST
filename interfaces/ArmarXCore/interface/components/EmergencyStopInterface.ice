/*
 * This file is part of ArmarX.
 *
 * ArmarX is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2 as
 * published by the Free Software Foundation.
 *
 * ArmarX is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package    ArmarXCore::components
 * @author     Stefan Reither ( stef dot reither at web dot de )
 * @date       2016
 * @copyright  http://www.gnu.org/licenses/gpl-2.0.txt
 *             GNU General Public License
 */

#pragma once

module armarx
{
    enum EmergencyStopState { eEmergencyStopActive, eEmergencyStopInactive };

    interface EmergencyStopMasterInterface
    {
        void setEmergencyStopState(EmergencyStopState state);
        ["cpp:const"] idempotent EmergencyStopState getEmergencyStopState();
    };

    interface EmergencyStopListener
    {
        void reportEmergencyStopState(EmergencyStopState state);
    };

    interface EmergencyStopNodeInterface extends EmergencyStopListener {};
};

