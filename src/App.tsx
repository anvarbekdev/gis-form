import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import "./globals.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";
import Navbar from "./components/ui/navbar";
import Step from "./components/ui/step";
import StepText from "./components/ui/step-text";
import Button from "./components/ui/button";
import file from "./assets/file.png";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  QuestionMarkCircledIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import {
  YMaps,
  Map,
  Placemark,
  SearchControl,
  TypeSelector,
} from "@pbe/react-yandex-maps";
import { z } from "zod";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Switch } from "./components/ui/switch";
import { useMediaQuery } from "react-responsive";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

const API_KEY = "a9574d29-a9a4-4ce6-b3bf-99919499ad18";

const center = [47.2313, 39.7233];
const images = [...Array(5)].map((i) => {
  const letter = String.fromCharCode(i + 97);
  return `https://img.icons8.com/ios-filled/2x/marker-${letter}.png`;
});

const stepText = {
  stepName: [
    "Joy nomi",
    "Joy rasimlari",
    "Joylashuv ma'lumotlari",
    "Joy turi",
    "Ish vaqtlari",
    "Havolalar",
    "Qo'shimcha ma'lumotlar",
    "Arizachi ma'lumoti",
  ],
  joyturi: [
    {
      name: "Ovqatlanish",
      variant: ["Fast Food", "Kafe", "Restoran", "Choyxona"],
    },
    {
      name: "Ovqatlanish",
      variant: ["Fast Food", "Kafe", "Restoran", "Choyxona"],
    },
    {
      name: "Sport",
      variant: [
        "Kibersport",
        "Fudbol",
        "Valebol",
        "Ganbol",
        "Tennis",
        "Suzish",
      ],
    },
    {
      name: "Sport",
      variant: [
        "Kibersport",
        "Fudbol",
        "Valebol",
        "Ganbol",
        "Tennis",
        "Suzish",
      ],
    },
    {
      name: "Dorixona",
      variant: ["Dorixona", "Veb orixona", "Agro dorixona"],
    },
    {
      name: "Transport",
      variant: ["Metro", "Avtobus"],
    },
  ],
};

type Option = {
  name: string;
  description: string;
  Point: {
    pos: string;
  };
};

type GeoObject = {
  getLocalities: () => string[];
  getAdministrativeAreas: () => string[];
  getThoroughfare: () => string | undefined;
  getPremise: () => string | undefined;
  getPremiseNumber: () => string | undefined;
};

const Step1Schema = z.object({
  joynomi: z.string().min(1, "Joy nomi bosh"),
  joyraqami: z.number({ message: "Joy raqami bosh" }),
});

const Step2Schema = Step1Schema.extend({
  image: z.string().min(1, "Rasm urli bosh "),
});
const Step3Schema = Step2Schema.extend({
  xaritajoynomi: z.string().min(1, "Xarita joyi bosh "),
});

type Form = z.infer<typeof Step3Schema>;

function App() {
  const [step, setStep] = useState(1);

  const ref = useRef<any>(null);
  const ref2 = useRef<any>(null);
  const ymaps = useRef<any>(null);

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-width: 1280px)",
  });
  const isTabletOrMobile = useMediaQuery({ query: "(min-width: 768px)" });
  const isMobile = useMediaQuery({ query: "(min-width: 320px)" });

  const [newCoords, setNewCoords] = useState<number[]>([]);
  const [address, setAddress] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [formErrors, setFormErrors] = useState([]) as any;

  const [formData, setFormData] = useState<Form>({
    joynomi: "",
    joyraqami: 0,
    image: "",
    xaritajoynomi: "",
  });

  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      const parsedFormData = JSON.parse(savedFormData);
      setFormData(parsedFormData);
    }
  }, []);

  // const handleForm = () => {
  //   const currentSchema = step === 1 ? Step1Schema : Step2Schema;
  //   const validationResult = currentSchema.safeParse(formData);
  //   if (validationResult.success) {
  //     console.log("Form data:", formData);

  //     localStorage.setItem("formData", JSON.stringify(formData));
  //   } else {
  //     console.error("Form validation error:", validationResult.error);
  //   }
  // };

  const [selectedTimezone, setSelectedTimezone] = useState<ITimezone>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const handleNext = () => {
    const currentSchema = Step1Schema;
    const validationResult = currentSchema.safeParse(formData);

    if (validationResult.success) {
      localStorage.setItem("formData", JSON.stringify(formData));
      setFormErrors([]);
      if (step < stepText.stepName.length) {
        setStep(step + 1);
      }
    } else {
      setFormErrors(
        validationResult.error?.errors.map((error) => error.message)
      );
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onImageChange = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataURL = e.target?.result as string;
        setFormData((prevData) => ({
          ...prevData,
          image: dataURL,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const weakNames = [
    "Dushanba",
    "Seyshanba",
    "Chorshanba",
    "Payshanba",
    "Juma",
    "Shanba",
    "Yakshanba",
  ];

  useEffect(() => {
    (async () => {
      try {
        if (value) {
          const res = await fetch(
            `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&format=json&geocode=${value}`
          );

          const data = await res.json();
          const collection =
            data.response.GeoObjectCollection.featureMember.map(
              (item: any) => item.GeoObject
            );
          setOptions(() => collection);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [value]);

  return (
    <div
      className={`max-w-6xl relative mx-auto flex flex-col justify-between ${
        step == 5 ? "h-[200vh]" : "min-h-screen"
      }`}
    >
      <div>
        <Navbar />
        <div className=" max-w-4xl mx-auto mt-10">
          <div className="md:hidden sm:flex justify-center">
            <span className={`mr-1 text-blue-500`}>{step}</span> / 8
          </div>
          <div className="numbers ">
            {stepText.stepName.map((_, index) => (
              <React.Fragment key={index}>
                {index != 0 ? (
                  isDesktopOrLaptop ? (
                    step > index ? (
                      <span className=" text-[#0eb37f]">------------</span>
                    ) : (
                      ". . . . . . . . . . . . . . ."
                    )
                  ) : isTabletOrMobile ? (
                    step > index ? (
                      <span className=" text-[#0eb37f]">-------</span>
                    ) : (
                      ". . . . . . . . ."
                    )
                  ) : (
                    isMobile && (
                      <hr
                        className={` w-8 h-1  mx-[2px] my-4 border-0 rounded md:my-10 
                      ${
                        step === index
                          ? "bg-blue-600 "
                          : step > index
                          ? "bg-[#0eb37f]"
                          : "bg-white"
                      }
                      `}
                      />
                    )
                  )
                ) : (
                  ""
                )}

                <div className="relative md:block sm:hidden">
                  <Step
                    styleClass={`step ${
                      step === index + 1
                        ? "active "
                        : "finish" && step > index + 1
                        ? "finish"
                        : ""
                    }`}
                    key={`Step ${index + 1}`}
                    number={index + 1}
                    check={step > index + 1}
                  />
                  {step === index + 1 && (
                    <StepText
                      styleClass={"absolute w-[110px] text-center left-[-39px]"}
                      text={stepText.stepName[step - 1]}
                    />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="md:mt-14  sm:mt-0 xl:max-w-full mx-auto md:max-w-xl md:border md:p-12 sm:p-4 rounded-xl md:bg-[#212124] ">
            <div className="">
              {step == 1 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Joy haqida
                  </h1>

                  <span className="text-sm text-gray-200">
                    {stepText.stepName[step - 1]}
                  </span>
                  <Input
                    type="text"
                    value={formData.joynomi}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        joynomi: event.target.value,
                      }))
                    }
                    title="This a Tooltip"
                    titledesc="Tooltips are used to describe or identify an element. In most scenarios, tooltips help the user understand meaning, function or alt-text."
                    icon={<QuestionMarkCircledIcon color="grey" />}
                    className="bg-transparent"
                    placeholder="Mini Market"
                  />
                  <div className=" text-sm text-red-500">
                    {formErrors.map((e: any) => {
                      if (e.path[0] === "joynomi") {
                        return e.message;
                      }
                    })}
                  </div>
                  <br />
                  <span className="text-sm text-gray-200">Telefon raqami</span>
                  <Input
                    type="number"
                    value={formData.joyraqami.toString()}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        joyraqami: parseInt(event.target.value),
                      }))
                    }
                    className="bg-transparent "
                    placeholder="+998"
                  />
                  <div className="text-sm text-red-500">
                    {formErrors.map((e: any) => {
                      if (e.path[0] === "joyraqami") {
                        return e.message;
                      }
                    })}
                  </div>
                </>
              )}
              {step == 2 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Joy rasimlari
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="">
                            <InfoCircledIcon className=" size-5" color="grey" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-[#3c4041]">
                          <h1 className=" text-md">This a Tooltip</h1>
                          <p className=" max-w-56 text-[13px]">
                            Tooltips are used to describe or identify an
                            element. In most scenarios, tooltips help the user
                            understand meaning, function or alt-text.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h1>

                  <div className="flex gap-2 lg:justify-start sm:justify-center">
                    <div className="lg:block sm:hidden bg-grey-lighter">
                      <label className="w-44 flex flex-col items-center px-4 py-6  text-blue rounded-xl shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                        <img src={file} alt="fileimg" />
                        <input
                          type="file"
                          onChange={onImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData?.image?.length === 0 && (
                      <div className="lg:hidden sm:block bg-grey-lighter">
                        <label className="w-44 flex flex-col items-center px-4 py-6  text-blue rounded-xl shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                          <img src={file} alt="fileimg" />
                          <input
                            type="file"
                            onChange={onImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                    {formData?.image?.length != 0 && (
                      <div className=" w-44  rounded-xl border flex items-center justify-center">
                        <img
                          className="h-36 "
                          src={formData.image}
                          alt={"image"}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
              {step == 3 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Joylashuv ma'lumotlari
                  </h1>

                  <div className=" max-w-xl">
                    <YMaps
                      query={{
                        load: "package.full",
                        apikey: API_KEY,
                        lang: "en_US",
                      }}
                    >
                      <Autocomplete
                        freeSolo
                        className="mb-4 text-white"
                        filterOptions={(x) => x}
                        value={formData.xaritajoynomi}
                        onChange={(event, newValue) => {
                          if (typeof newValue === "string") {
                            event = event;
                            setValue(newValue);
                            setFormData((prevData) => ({
                              ...prevData,
                              xaritajoynomi: newValue,
                            }));

                            const obg = options.find(
                              (item) =>
                                newValue.includes(item.name) &&
                                newValue.includes(item.description)
                            );
                            if (obg) {
                              const coords = obg.Point.pos
                                .split(" ")
                                .map((item) => Number(item))
                                .reverse();
                              setNewCoords(coords);
                              setAddress(newValue);
                            }
                          } else {
                            console.log(newValue);
                          }
                        }}
                        onInputChange={(event, newInputValue) => {
                          if (newInputValue) {
                            event = event;
                            setValue(newInputValue);
                          }
                        }}
                        options={options.map(
                          (item) => `${item.name} ${item.description}`
                        )}
                        renderInput={(params) => (
                          <TextField
                            className=" bg-slate-200 rounded-md"
                            {...params}
                            
                            label="Joy manzilini kiriting"
                          />
                        )}
                      />

                      <Map
                        instanceRef={ref2}
                        state={{
                          center: [47.2313, 39.7233],
                          zoom: 9,
                          controls: ["zoomControl"],
                        }}
                        onLoad={(e: any) => {
                          ymaps.current = e;
                          const points = [
                            [48.024402067130715, 39.85466330972504],
                            [46.780699672601415, 39.807971415195674],
                          ];
                          const bounds = e.util.bounds.fromPoints(points);
                          ref2.current.setBounds(bounds, {
                            checkZoomRange: true,
                          });

                          e.geocode(newCoords).then((res: any) => {
                            const firstGeoObject: GeoObject =
                              res.geoObjects.get(0);
                            const newAddress = [
                              firstGeoObject.getLocalities().length
                                ? firstGeoObject.getLocalities()
                                : firstGeoObject.getAdministrativeAreas(),
                              firstGeoObject.getThoroughfare() ||
                                firstGeoObject.getPremise(),
                              firstGeoObject.getPremiseNumber(),
                            ]
                              .filter(Boolean)
                              .join(", ");

                            setAddress(newAddress);
                            setValue(newAddress);
                          });
                        }}
                        // width={isMobile ? '320px': isTabletOrMobile  ? "500px":''}
                        height="60vh"
                        modules={["control.ZoomControl"]}
                        onClick={(event: any) => {
                          const coords: [number, number] = event.get("coords");
                          setNewCoords(coords);

                          ymaps.current.geocode(coords).then((res: any) => {
                            const firstGeoObject: GeoObject =
                              res.geoObjects.get(0);
                            const newAddress = [
                              firstGeoObject.getLocalities().length
                                ? firstGeoObject.getLocalities()
                                : firstGeoObject.getAdministrativeAreas(),
                              firstGeoObject.getThoroughfare() ||
                                firstGeoObject.getPremise(),
                              firstGeoObject.getPremiseNumber(),
                            ]
                              .filter(Boolean)
                              .join(", ");
                            ref.current.getMap().hint.open(coords, newAddress);
                            setAddress(newAddress);
                            setValue(newAddress);
                          });
                        }}
                      >
                        <SearchControl options={{ float: "right" }} />
                        <TypeSelector />
                        <Placemark
                          instanceRef={ref}
                          onDragEnd={() => {
                            const coords: [number, number] =
                              ref.current.geometry._coordinates;
                            setNewCoords(coords);
                            ymaps.current.geocode(coords).then((res: any) => {
                              const firstGeoObject: GeoObject =
                                res.geoObjects.get(0);
                              const newAddress = [
                                firstGeoObject.getLocalities().length
                                  ? firstGeoObject.getLocalities()
                                  : firstGeoObject.getAdministrativeAreas(),
                                firstGeoObject.getThoroughfare() ||
                                  firstGeoObject.getPremise(),
                                firstGeoObject.getPremiseNumber(),
                              ]
                                .filter(Boolean)
                                .join(", ");
                              ref.current
                                .getMap()
                                .hint.open(coords, newAddress);
                              setAddress(newAddress);
                              setValue(newAddress);
                            });
                          }}
                          geometry={newCoords}
                          options={{
                            iconImageSize: [30, 30],
                            draggable: true,
                            preset: "islands#greenIcon",
                            hideIconOnBalloonOpen: false,
                            openEmptyHint: true,
                          }}
                          properties={{
                            iconContent: "+",
                            hintContent: address,
                          }}
                        />
                        {images.map((n, i) => (
                          <Placemark
                            onClick={() => {
                              alert("belgilangan " + (i + 1));
                            }}
                            key={n}
                            defaultGeometry={center.map(
                              (c) => c + (Math.random() - 0.5)
                            )}
                            options={{
                              iconImageSize: [10, 10],
                              preset: "islands#yellowDotIcon",
                            }}
                          />
                        ))}
                      </Map>
                    </YMaps>
                    <br />
                    <span className="text-lg text-gray-200">
                      Joy haqida ma'lumotlar
                    </span>
                    <Textarea className=" text-md" placeholder="Joy haqida" />
                  </div>
                </>
              )}
              {step == 4 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Joy turi
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="">
                            <InfoCircledIcon className=" size-5" color="grey" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-[#3c4041]">
                          <h1 className=" text-md">This a Tooltip</h1>
                          <p className=" max-w-56 text-[13px]">
                            Tooltips are used to describe or identify an
                            element. In most scenarios, tooltips help the user
                            understand meaning, function or alt-text.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h1>

                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-y-2">
                    {stepText.joyturi.map((i, index) => (
                      <div key={index}>
                        <h1 className=" text-lg mb-1">{i.name}</h1>
                        {i.variant.map((i, index) => (
                          <div key={index} className="mb-2">
                            <label className="flex items-center font-thin">
                              <input
                                type="checkbox"
                                className=" size-4 mr-1 text-blue-950"
                              />
                              <span className=" text-sm">{i}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {step == 5 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Ish vaqtlari
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="">
                            <InfoCircledIcon className=" size-5" color="grey" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-[#3c4041]">
                          <h1 className=" text-md">This a Tooltip</h1>
                          <p className=" max-w-56 text-[13px]">
                            Tooltips are used to describe or identify an
                            element. In most scenarios, tooltips help the user
                            understand meaning, function or alt-text.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h1>
                  <h1 className=" text-lg mb-2">Hafta kunlari</h1>
                  {weakNames.map((i) => (
                    <label
                      key={i.length}
                      className="flex xl:w-1/2 sm:w-full items-center justify-between my-4"
                    >
                      <div className="flex items-center">
                        <Switch />
                        <span className="ml-2">{i}</span>
                      </div>
                      <div>
                        <span className="mx-2 text-gray-400 border py-1 px-3 rounded-md">
                          09:00
                        </span>
                        -
                        <span className="mx-2 text-gray-400 border py-1 px-3 rounded-md">
                          18:00
                        </span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <Switch />
                    <span className="ml-2">Dam olish kunlarisiz</span>
                  </label>
                  <h1 className="mt-8 flex items-center gap-2 text-lg border-b pb-3">
                    Vaqt mintaqasi
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="">
                            <InfoCircledIcon className=" size-4" color="grey" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-[#3c4041]">
                          <h1 className=" text-md">This a Tooltip</h1>
                          <p className=" max-w-56 text-[13px]">
                            Tooltips are used to describe or identify an
                            element. In most scenarios, tooltips help the user
                            understand meaning, function or alt-text.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h1>
                  <div className=" w-1/2 mt-3">
                    <TimezoneSelect
                      value={selectedTimezone}
                      onChange={setSelectedTimezone}
                    />
                  </div>
                </>
              )}
              {step == 6 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Havolalar
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="">
                            <InfoCircledIcon className=" size-5" color="grey" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-[#3c4041]">
                          <h1 className=" text-md">This a Tooltip</h1>
                          <p className=" max-w-56 text-[13px]">
                            Tooltips are used to describe or identify an
                            element. In most scenarios, tooltips help the user
                            understand meaning, function or alt-text.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h1>
                  <div className="text-sm text-gray-200 mb-1">
                    Web sayt uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="www.example.com"
                  />
                  <div className="text-sm text-gray-200 mt-4 mb-1">
                    Instagram uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="www.instagram.com"
                  />
                  <div className="text-sm text-gray-200 mt-4 mb-1">
                    Telegram uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="www.telegram.me"
                  />
                  <div className="text-sm text-gray-200 mt-4 mb-1">
                    Telegram bot uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="@telegram_bot"
                  />
                  <div className="text-sm text-gray-200 mt-4 mb-1">
                    Facebook uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="www.facebook.com"
                  />
                  <div className="text-sm text-gray-200 mt-4 mb-1">
                    Twitter uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="www.twitter.com"
                  />
                  <div className="text-sm text-gray-200 mt-4 mb-1">
                    Youtube uchun havola
                  </div>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="www.youtube.com"
                  />
                </>
              )}
              {step == 7 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Qo'shimcha ma'lumotlar
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="">
                            <InfoCircledIcon className=" size-5" color="grey" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-[#3c4041]">
                          <h1 className=" text-md">This a Tooltip</h1>
                          <p className=" max-w-56 text-[13px]">
                            Tooltips are used to describe or identify an
                            element. In most scenarios, tooltips help the user
                            understand meaning, function or alt-text.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h1>

                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-y-2">
                    {stepText.joyturi.map((i, index) => (
                      <div key={index}>
                        {i.variant.map((i, index) => (
                          <div key={index} className="mb-2">
                            <label className="flex items-center font-thin">
                              <input
                                type="checkbox"
                                className=" size-4 mr-1 text-blue-950"
                              />
                              <span className=" text-sm">{i}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {step == 8 && (
                <>
                  <h1 className="mb-8 text-gray-200 xl:text-3xl flex items-center sm:text-2xl gap-2 border-b pb-3">
                    Arizachi ma'lumoti
                  </h1>

                  <span className="text-sm text-gray-200">Familya va ism</span>
                  <Input
                    type="text"
                    className="bg-transparent "
                    placeholder="Familya ism"
                  />
                  <br />
                  <span className="text-sm text-gray-200">Telefon raqami</span>
                  <Input
                    type="number"
                    className="bg-transparent "
                    placeholder="+998"
                  />
                </>
              )}
            </div>
            <div className={`flex md:flex sm:hidden justify-end mt-10`}>
              {step != 1 && (
                <Button
                  styleClass={`border-2 border-blue-800 hover:bg-blue-800 px-3 py-2 rounded-xl`}
                  onClick={handlePrevious}
                >
                  <ArrowLeftIcon className="mr-2 size-5 inline-block" />
                  Orqaga
                </Button>
              )}
              <Button
                styleClass={`border-2 ml-6  border-blue-800 hover:bg-transparent bg-blue-800 px-3 py-2 rounded-xl`}
                onClick={() => {
                  if (step === 1) {
                    const validationResult = Step1Schema.safeParse(formData);

                    setFormErrors(
                      validationResult.error?.errors.map((error) => error)
                    );

                    if (validationResult.success) {
                      handleNext();
                    } else {
                      setFormErrors(
                        validationResult.error?.errors.map((error) => error)
                      );
                    }
                  } else if (step === 2) {
                    const validationResult = Step2Schema.safeParse(formData);
                    if (validationResult.success) {
                      handleNext();
                    } else {
                      setFormErrors(
                        validationResult.error?.errors.map((error) => error)
                      );
                    }
                  } else if (step === 3) {
                    const validationResult = Step3Schema.safeParse(formData);
                    if (validationResult.success) {
                      handleNext();
                    } else {
                      setFormErrors(
                        validationResult.error?.errors.map((error) => error)
                      );
                    }
                  } else {
                    handleNext();
                  }
                }}
              >
                {step == 8 ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Yuborish</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogTitle>Arizangiz qabul qilindi</DialogTitle>
                      <DialogDescription>
                        Arizangiz moderatorlarimiz tomonidan ko’rib chiqilib, 24
                        soat ichida javob beriladi
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
                ) : (
                  "Keyingisi"
                )}
                <ArrowRightIcon className="ml-2 size-5 inline-block" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className={` mb-10 mx-4 md:hidden sm:block`}>
        <div
          className={`flex md:justify-end border-t pt-4 ${
            step == 1 ? "sm:justify-end" : "sm:justify-between"
          } mt-4`}
        >
          {step != 1 && (
            <Button
              styleClass={`border border-blue-800 hover:bg-blue-800 px-3 py-2 rounded-xl`}
              onClick={handlePrevious}
            >
              <ArrowLeftIcon className="mr-2 size-5 inline-block" />
              Orqaga
            </Button>
          )}
          <Button
            styleClass={`border md:mr-0 hover:bg-transparent bg-blue-800 border-blue-800  px-3 py-2 rounded-xl`}
            onClick={() => {
              if (step === 1) {
                const validationResult = Step1Schema.safeParse(formData);

                setFormErrors(
                  validationResult.error?.errors.map((error) => error)
                );

                if (validationResult.success) {
                  handleNext();
                } else {
                  setFormErrors(
                    validationResult.error?.errors.map((error) => error)
                  );
                }
              } else if (step === 2) {
                const validationResult = Step2Schema.safeParse(formData);
                if (validationResult.success) {
                  handleNext();
                } else {
                  setFormErrors(
                    validationResult.error?.errors.map((error) => error)
                  );
                }
              } else if (step === 3) {
                const validationResult = Step3Schema.safeParse(formData);
                if (validationResult.success) {
                  handleNext();
                } else {
                  setFormErrors(
                    validationResult.error?.errors.map((error) => error)
                  );
                }
              } else {
                handleNext();
              }
            }}
          >
            {step == 8 ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Yuborish</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[300px]">
                  <DialogHeader>
                    <DialogTitle>Arizangiz qabul qilindi</DialogTitle>
                    <DialogDescription>
                      Arizangiz moderatorlarimiz tomonidan ko’rib chiqilib, 24
                      soat ichida javob beriladi
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            ) : (
              "Keyingisi"
            )}
            <ArrowRightIcon className="ml-2 size-5 inline-block" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
