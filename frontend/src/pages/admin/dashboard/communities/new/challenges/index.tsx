import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  useToast,
} from "@chakra-ui/react";
import DashboardLayout from "src/components/AdminDashboardLayout";
import TextEditor from "src/components/TextEditor";

import { useEffect, useRef, useState } from "react";
import { CoverImageUploader } from "src/components/CoverImageUploader";
import { useStorageUpload } from "@thirdweb-dev/react";
import { useFormik } from "formik";
import { resolveIPFSURI } from "src/helpers";
import { useInAppAuth } from "src/hooks/common";
import isEmpty from "just-is-empty";
import {
  useCreateCommunityMutation,
  useCreateCommunityChallengeMutation,
} from "src/state/services";
import { BsChevronDown, BsChevronLeft } from "react-icons/bs";
import { Link } from "@chakra-ui/next-js";
import {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "next/types";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";

const NewChallengePage = ({
  cid: communityIdFromServerSideProps,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const communityId =
    communityIdFromServerSideProps || router.query.communityId;
  const { mutateAsync: uploadToThirdweb } = useStorageUpload();
  const [coverFile, setCoverFile] = useState<File>();
  const [detailsContent, setDetailsContent] = useState<string>("");
  const [challengeStartDate, setChallengeStartDate] = useState(new Date());
  const [challengeEndDate, setChallengeEndDate] = useState(new Date());
  const { user, connect, isLoggedIn } = useInAppAuth();
  const editorRef = useRef<{ resetContent: () => void }>(null);
  const [createCommunityChallenge, {}] = useCreateCommunityChallengeMutation();
  const toast = useToast({
    duration: 3000,
    position: "top",
    status: "success",
    title: "Community challenge created successfully",
  });
  const handleEditorReset = () => {
    if (editorRef.current) {
      editorRef.current.resetContent();
    }
  };
  const handleDateSelect = (date: Date, type: "start" | "end") => {
    if (type === "start") {
      setChallengeStartDate(date);
      formik.setFieldValue("startDate", date);
    } else {
      setChallengeEndDate(date);
      formik.setFieldValue("endDate", date);
    }
  };
  const handleDateChange = (date: Date, type: "start" | "end") => {
    if (type === "start") {
      setChallengeStartDate(date);
      formik.setFieldValue("startDate", date);
    } else {
      setChallengeEndDate(date);
      formik.setFieldValue("endDate", date);
    }
  };
  const formik = useFormik({
    initialValues: {
      title: "",
      details: "",
      venue: "",
      location: "",
      startDate: challengeStartDate,
      endDate: challengeEndDate,
    },
    onSubmit: async (values, actions) => {
      if (!isLoggedIn) {
        connect();
        return;
      }
      if (isEmpty(communityId)) {
        toast({
          title: "No communityID provided",
          status: "error",
        });
      }
      actions.setSubmitting(true);
      try {
        const dataToSave = {
          title: values.title,
          details: values.details,
          coverImage: "",
          location: values.location,
          venue: values.venue,
          communityId: communityId,
          startDate: values.startDate,
          endDate: values.endDate,
        };
        console.log({ dataToSave });

        if (coverFile) {
          const coverImageRes = await uploadToThirdweb({ data: [coverFile] });
          dataToSave.coverImage = resolveIPFSURI(coverImageRes[0]);
        }

        await createCommunityChallenge(dataToSave);
        actions.setSubmitting(false);

        toast({
          title: "Community Challenge created successfully",
          status: "success",
        });
        setTimeout(() => {
          handleFieldReset();
        }, 2000);
      } catch (err) {
        console.log(err);
        toast({
          title: "An error occurred, please try again",
          status: "error",
        });
        actions.setSubmitting(false);
      }
    },
  });
  function handleFieldReset() {
    formik.resetForm();
    formik.setFieldValue("details", "");
    formik.setFieldValue("startDate", new Date());
    formik.setFieldValue("endDate", formik.values.startDate);
    setCoverFile(undefined);
    setDetailsContent("");
    handleEditorReset();
  }
  function handleGetCoverFile(file: File | null) {
    setCoverFile(file as File);
  }

  useEffect(() => {
    formik.setFieldValue("details", detailsContent);
    console.log({ vv: formik.values });
  }, [detailsContent]);
  return (
    <DashboardLayout>
      <Flex direction={"column"} w={"full"} pb={5} px={4}>
        <HStack mb={10}>
          <Button
            gap={2}
            bg={"gray.700"}
            variant={"solid"}
            // pos={"absolute"}
            top={3}
            left={3}
            colorScheme="gray"
            zIndex={5}
            as={Link}
            _hover={{ bg: "gray.800" }}
            href={"/admin/dashboard/communities"}
          >
            <BsChevronLeft /> <Text> Back</Text>
          </Button>
        </HStack>
        <Heading mb={2} size={"lg"}>
          Add new challenge
        </Heading>
        <Stack
          gap={5}
          mt={8}
          divider={<Divider />}
          as={"form"}
          /* @ts-ignore */
          onSubmit={formik.handleSubmit}
        >
          <FormControl isRequired>
            <FormLabel htmlFor="Challenge-name">Challenge title:</FormLabel>
            <Input
              rounded={"12px"}
              isRequired
              id="Challenge-name"
              h={"auto"}
              fontWeight={500}
              _focus={{
                boxShadow: "0 0 0 1px transparent",
                borderColor: "gs-yellow.400",
              }}
              autoComplete="off"
              name="title"
              value={formik.values.title}
              py={3}
              placeholder="Challenge title"
              fontSize={20}
              onChange={formik.handleChange}
              // size={"md"}
            />
          </FormControl>

          <Box>
            <FormLabel size={"md"} mt={2} mb={4} htmlFor="cover-image">
              Cover image:
            </FormLabel>
            <CoverImageUploader
              inputId="cover-image"
              getCoverImageFile={handleGetCoverFile}
            />
          </Box>
          <HStack wrap={{ base: "wrap", md: "nowrap" }} gap={3}>
            <FormControl isRequired maxW={250}>
              <FormLabel htmlFor="venue">Venue:</FormLabel>
              <Menu>
                <MenuButton
                  name="venue"
                  as={Button}
                  colorScheme="gs-yellow"
                  rightIcon={<BsChevronDown />}
                >
                  {formik.values.venue || "Choose Venue"}
                </MenuButton>
                <MenuList zIndex={3}>
                  <MenuOptionGroup
                    defaultValue="online"
                    title="Venue"
                    type="radio"
                  >
                    <MenuItemOption
                      name="venue"
                      value="online"
                      onClick={() => {
                        formik.setFieldValue("venue", "online");
                      }}
                    >
                      Online
                    </MenuItemOption>
                    <MenuItemOption
                      name="venue"
                      value="in-person"
                      onClick={() => {
                        formik.setFieldValue("venue", "in-person");
                      }}
                    >
                      In Person
                    </MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="location">Location:</FormLabel>
              <Input
                rounded={"12px"}
                placeholder="Block 123, Challenge Avenue, West Suite"
                id="location"
                name="location"
                _focus={{
                  boxShadow: "0 0 0 1px transparent",
                  borderColor: "gs-yellow.400",
                }}
                value={formik.values.location}
                onChange={formik.handleChange}
              />
            </FormControl>
          </HStack>
          <HStack wrap={{ base: "wrap", md: "nowrap" }} gap={3}>
            <FormControl isRequired>
              <FormLabel htmlFor="details">Start Date:</FormLabel>
              <DatePicker
                minDate={new Date()}
                className="gs-datepicker"
                calendarClassName="gs-datepicker-calendar"
                wrapperClassName="gs-datepicker-wrapper"
                popperClassName="gs-datepicker-popper"
                showTimeSelect
                selectsStart
                selected={challengeStartDate}
                // TODO: use formik directly (value & onChange)
                onSelect={(date: Date) => handleDateSelect(date, "start")} //when day is clicked
                onChange={(date: Date) => handleDateChange(date, "start")} //only when value has changed
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="end-date">End Date:</FormLabel>
              <DatePicker
                className="gs-datepicker"
                calendarClassName="gs-datepicker-calendar"
                wrapperClassName="gs-datepicker-wrapper"
                popperClassName="gs-datepicker-popper"
                minDate={challengeStartDate}
                showTimeSelect
                // inline
                selectsStart
                selected={challengeEndDate}
                // TODO: use formik directly (value & onChange)
                onSelect={(date: Date) => handleDateSelect(date, "end")} //when day is clicked
                onChange={(date: Date) => handleDateChange(date, "end")} //only when value has changed
              />
            </FormControl>
          </HStack>
          <Box>
            <FormLabel size={"md"} mt={2} mb={4}>
              Details about this challenge
            </FormLabel>
            <TextEditor
              ref={editorRef}
              onContentChange={(content) => setDetailsContent(content)}
              initialValue={detailsContent}
            />
          </Box>
          <HStack
            gap={4}
            pos={"sticky"}
            bottom={0}
            bg={"black"}
            zIndex={50}
            pt={1}
            pb={3}
          >
            <Button
              type="submit"
              rounded={"full"}
              colorScheme="gs-yellow"
              isLoading={formik.isSubmitting}
              loadingText="Creating challenge..."
            >
              Create challenge
            </Button>
          </HStack>
        </Stack>
      </Flex>
    </DashboardLayout>
  );
};
export default NewChallengePage;
export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  const { cid } = query;

  // Pass the pathname as props
  return {
    props: {
      cid: cid as string,
    },
  };
}
