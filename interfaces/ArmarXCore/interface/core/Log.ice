/*
* This file is part of ArmarX.
*
* Copyright (C) 2011-2016, High Performance Humanoid Technologies (H2T), Karlsruhe Institute of Technology (KIT), all rights reserved.
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
* @package    ArmarX::Core
* @author     Kai Welke <welke at kit dot edu>
* @copyright  2011 Humanoids Group, HIS, KIT
* @license    http://www.gnu.org/licenses/gpl-2.0.txt
*             GNU General Public License
*/

#pragma once

module armarx
{
    enum MessageType { eUNDEFINED, eDEBUG, eVERBOSE, eINFO, eIMPORTANT, eWARN, eERROR, eFATAL, eLogLevelCount };

    struct LogMessage{
        string who;
        long time;
        string group;
        string tag;
        MessageType type;
        string what;
        string file;
        int line;
        string function;
        string backtrace;
        int threadId;

    };

    interface Log
    {
        void writeLog(LogMessage logMsg);
    };
};

