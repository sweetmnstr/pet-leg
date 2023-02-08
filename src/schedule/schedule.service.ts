import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { TimeSlot } from './entities/timeslot.entity';
import { CreateTimeslotDTO } from './dto/create-timeslot.dto';
import { UpdateTimeslotDTO } from './dto/update-timeslot.dto';
import { GetLawyerScheduleDTO } from './dto/get-lawyer-schedule.dto';
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { AvailabilityDTO } from './dto/available.dto';
import * as moment from 'moment';

@Injectable()
export class ScheduleService extends TypeOrmCrudService<Schedule> {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(TimeSlot)
    private timeslotRepository: Repository<TimeSlot>,
  ) {
    super(scheduleRepository);
  }

  async getLawyerSchedule({
    lawyerId,
    date,
    timezone,
  }: GetLawyerScheduleDTO): Promise<any> {
    const baseWhere = {
      schedule: {
        lawyer: {
          id: lawyerId,
        },
      },
    };
    const timeslots = await this.timeslotRepository.find({
      relations: { schedule: true },
      where: {
        ...baseWhere,
        date,
      },
    });
    return {
      timeslots: timeslots.map((timeslot) =>
        this.toLawyerTimeslot(timeslot, date, timezone),
      ),
    };
  }

  toLawyerTimeslot(timeslot: TimeSlot, date: string, timezone: string) {
    return {
      id: timeslot.id,
      date: timeslot.date || date,
      startAt: this.timeToTimeZone(
        `${timeslot.date} ${timeslot.startAt}`,
        timezone,
      ),
      finishAt: this.timeToTimeZone(
        `${timeslot.date} ${timeslot.finishAt}`,
        timezone,
      ),
      timezone,
    };
  }

  toUtcTime(date: string, time: string, timezone: string | null) {
    timezone = timezone || 'Europe/London';
    try {
      const utcTime = zonedTimeToUtc(`${date} ${time}:00`, timezone);
      return utcTime.toISOString().slice(date.length);
    } catch {
      throw new BadRequestException(`Timezone (${timezone}) is not exits`);
    }
  }

  timeToTimeZone(date: string, timezone: string | null) {
    timezone = timezone || 'Europe/London';
    try {
      const pattern = 'HH:mm';
      return format(utcToZonedTime(new Date(date), timezone), pattern);
    } catch {
      throw new BadRequestException(`Timezone (${timezone}) is not exits`);
    }
  }
  toDayOff(date: string) {
    return format(new Date(date), 'EEEE').toLowerCase();
  }

  async isTimeslotReserved(
    createTimeslotDto: CreateTimeslotDTO,
  ): Promise<boolean> {
    const { lawyer, date, startAt, finishAt, timezone } = createTimeslotDto;
    const dayOff = this.toDayOff(date);
    const where = `"schedule"."lawyerId" = :lawyerId AND 
      (("timeSlot"."date" + "timeSlot"."startAt") >= :startDate AND ("timeSlot"."date" + "timeSlot"."finishAt") <= :finishDate)
    `;
    const schedule = await this.scheduleRepository.findOne({
      where: { lawyer: { id: lawyer.id } },
    });
    const query = this.timeslotRepository
      .createQueryBuilder('timeSlot')
      .leftJoinAndSelect('timeSlot.schedule', 'schedule')
      .where(where, {
        lawyerId: lawyer.id,
        startDate: `${date} ${startAt}`,
        finishDate: `${date} ${finishAt}`,
        startAt,
        finishAt,
      });

    let available;

    try {
      available = schedule?.availability[dayOff]?.filter(
        (slot) =>
          this.timeToTimeZone(`${date}${startAt}`, timezone) <
            this.timeToTimeZone(`${date}${slot.to}`, schedule.timezone) &&
          this.timeToTimeZone(`${date}${slot.from}`, schedule.timezone) <
            this.timeToTimeZone(`${date}${finishAt}`, timezone),
      ).length;
    } catch (e) {
      available = false;
    }

    return !!(await query.getCount()) || !!available;
  }

  async createTimeSlot(
    createTimeslotDto: CreateTimeslotDTO,
  ): Promise<TimeSlot> {
    const { date, startAt, finishAt, lawyer } = createTimeslotDto;
    const isTimeslotReserved = await this.isTimeslotReserved(createTimeslotDto);
    if (isTimeslotReserved)
      throw new BadRequestException('Timeslot is reserved');
    const schedule = await this.findOrCreate(lawyer.id);
    const entityLike = {
      date,
      startAt,
      finishAt,
      schedule,
    };
    const timeSlot = this.timeslotRepository.create(entityLike);
    return await this.timeslotRepository.save(timeSlot);
  }

  async updateTimeSlot(
    updateTimeslotDto: UpdateTimeslotDTO,
  ): Promise<TimeSlot> {
    const { consultation, date, startAt, finishAt } = updateTimeslotDto;
    const isTimeslotReserved = await this.isTimeslotReserved(updateTimeslotDto);
    if (isTimeslotReserved)
      throw new BadRequestException('Timeslot is reserved');

    const timeSlot = await this.timeslotRepository
      .createQueryBuilder()
      .update({
        date,
        startAt,
        finishAt,
      })
      .where({
        consultation,
      })
      .returning('*')
      .execute();

    return timeSlot[0];
  }

  async getTimeSlot(id: number): Promise<TimeSlot> {
    const foundTimeSlot = await this.timeslotRepository.findOne({
      where: { id },
      relations: {
        schedule: true,
      },
    });

    return foundTimeSlot;
  }

  async setLawyerAvailability(
    lawyerId: number,
    availabilityDTO: AvailabilityDTO,
  ): Promise<boolean> {
    const timezone = availabilityDTO.timezone;
    delete availabilityDTO.timezone;
    await this.scheduleRepository.update(
      { lawyer: { id: lawyerId } },
      { availability: availabilityDTO, timezone },
    );

    return true;
  }

  async findOrCreate(lawyerId: number): Promise<Schedule> {
    const scheduleBody = { lawyer: { id: lawyerId } };
    let schedule = await this.scheduleRepository.findOne({
      where: scheduleBody,
    });
    if (schedule) return schedule;
    schedule = this.scheduleRepository.create(scheduleBody);
    return await this.scheduleRepository.manager.save(schedule);
  }
}
