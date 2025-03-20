/**
* This file is part of ArmarX.
*
* ArmarX is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as
* published by the Free Software Foundation; either version 2 of
* the License, or (at your option) any later version.
*
* ArmarX is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*
* @package    RobotAPI
* @author     Christoph Pohl
* @copyright  2020 Humanoids Group, H2T, KIT
* @license    http://www.gnu.org/licenses/gpl-2.0.txt
*             GNU General Public License
*/

#pragma once

module armarx
{
    /**
	* [NameValueMap] defined. This data container is mostly used to assign values to e.g. joints which are identified by name.
	**/
    dictionary<string, float> NameValueMap;
}