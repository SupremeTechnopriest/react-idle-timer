import { useState, useRef, MutableRefObject, BaseSyntheticEvent } from 'react'
import { useTranslation } from 'next-i18next'
import {
  chakra,
  Box,
  Container,
  Flex,
  FlexProps,
  VStack,
  HStack,
  Grid,
  Button,
  Text,
  Icon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  InputGroup,
  InputRightElement,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  FormControl,
  FormLabel,
  Switch,
  Spacer,
  useColorModeValue
} from '@chakra-ui/react'

import { BsInfoLg } from 'react-icons/bs'
import { Window } from '@components/Window'

import { debounceFn } from '@utils/debounce'

const descriptionDefault = 'Hover over a property or method to see a description.'

function postMessage (event: string, data: any, targets: MutableRefObject<HTMLIFrameElement>[]) {
  const deferred = []
  for (const target of targets) {
    if (target.current) {
      target.current.contentWindow.postMessage({ event, data })
    } else {
      deferred.push([event, data, [target]])
    }
  }
  if (deferred.length) {
    setTimeout(() => {
      for (const [event, data, targets] of deferred) {
        postMessage(event, data, targets)
      }
    }, 1000)
  }
}

interface IButtonWithEventProps {
  event: string
  description: string
  frames: MutableRefObject<HTMLIFrameElement>[]
  setDescription: (desc: string) => void
}

function ButtonWithEvent (props: IButtonWithEventProps) {
  return (
    <Button
      w='full'
      fontSize='14'
      _hover={{
        bg: 'red.400',
        color: 'white'
      }}
      onMouseOver={() => props.setDescription(props.description)}
      onMouseOut={() => props.setDescription(descriptionDefault)}
      onClick={() => postMessage(props.event, null, props.frames)}>
        {props.event}
    </Button>
  )
}

interface ISwitchWithEventProps {
  event: string
  description: string
  frames: MutableRefObject<HTMLIFrameElement>[]
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  setDescription: (desc: string) => void
}

function SwitchWithEvent (props: ISwitchWithEventProps) {
  return (
    <FormControl
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      role='group'
      cursor='pointer'
      onMouseOver={() => props.setDescription(props.description)}
      onMouseOut={() => props.setDescription(descriptionDefault)}
      onChange={(e: BaseSyntheticEvent) => {
        const checked = e.target.checked
        if (props.onChange) props.onChange(checked)
        postMessage(props.event, checked, props.frames)
      }}
    >
      <FormLabel
        htmlFor={props.event}
        mb='0'
        mr={3}
        cursor='pointer'
        _groupHover={{
          color: 'red.400'
        }}
      >
        {props.event}
      </FormLabel>
      <Switch
        id={props.event}
        defaultChecked={props.defaultChecked}
        colorScheme='red'
      />
    </FormControl>
  )
}

interface INumberInputWithEventProps extends FlexProps {
  event: string
  description: string
  frames: MutableRefObject<HTMLIFrameElement>[]
  defaultValue: number
  setDescription: (desc: string) => void
}

function NumberInputWithEvent (props: INumberInputWithEventProps) {
  const { event, frames, setDescription, defaultValue, ...rest } = props
  const onChange = debounceFn((value: number) => {
    postMessage(event, value, frames)
  }, 500)

  return (
    <Flex
      w='full'
      justify='space-between'
      align='center'
      role='group'
      onMouseOver={() => setDescription(props.description)}
      onMouseOut={() => setDescription(descriptionDefault)}
      {...rest}
    >
      <Text _groupHover={{ color: 'red.400' }}>{event}</Text>
      <NumberInput
        w={125}
        defaultValue={defaultValue}
        focusBorderColor='red.400'
        onChange={onChange}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Flex>
  )
}

interface IMessageInputProps extends FlexProps {
  event: string
  description: string
  frames: MutableRefObject<HTMLIFrameElement>[]
  setDescription: (desc: string) => void
}

function MessageInput (props: IMessageInputProps) {
  const [message, setMessage] = useState<string>('Hello')

  const onClick = () => {
    if (message) {
      postMessage(props.event, message, props.frames)
    }
  }

  return (
    <InputGroup size='md'>
      <Input
        pr='4.5rem'
        type='text'
        defaultValue={message}
        placeholder='Message Content'
        onChange={event => setMessage(event.target.value)}
        onMouseOver={() => props.setDescription(props.description)}
        onMouseOut={() => props.setDescription(descriptionDefault)}
      />
      <InputRightElement width='6rem'>
        <Button
          h='1.75rem'
          size='sm'
          _hover={{
            bg: 'red.400',
            color: 'white'
          }}
          onClick={onClick}
          onMouseOver={() => props.setDescription(props.description)}
          onMouseOut={() => props.setDescription(descriptionDefault)}
        >
          message
        </Button>
      </InputRightElement>
    </InputGroup>
  )
}

interface IControlPanelProps {
  frameA: MutableRefObject<HTMLIFrameElement>
  frameB: MutableRefObject<HTMLIFrameElement>
  crossTab: boolean
  setCrossTab: (enabled: boolean) => void
  setDescription: (desc: string) => void
}

function ControlPanel ({ frameA, frameB, crossTab, setCrossTab, setDescription }: IControlPanelProps) {
  const { t } = useTranslation('common')
  return (
    <Tabs isFitted variant='enclosed' colorScheme='red'>
      <TabList mb='1em'>
        <Tab>Props</Tab>
        <Tab>Methods</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <VStack>
            <NumberInputWithEvent event='timeout' defaultValue={2000} frames={[frameA, frameB]} setDescription={setDescription} description={t('props.timeout')} />
            <NumberInputWithEvent event='promptBeforeIdle' defaultValue={0} frames={[frameA, frameB]} setDescription={setDescription} description={t('props.promptBeforeIdle')} />
            <NumberInputWithEvent event='debounce' defaultValue={0} frames={[frameA, frameB]} setDescription={setDescription} description={t('props.debounce')} />
            <NumberInputWithEvent event='throttle' defaultValue={0} frames={[frameA, frameB]} setDescription={setDescription} description={t('props.throttle')} />
            <NumberInputWithEvent event='eventsThrottle' defaultValue={0} frames={[frameA, frameB]} setDescription={setDescription} description={t('props.eventsThrottle')} />
            <Spacer />
            <SwitchWithEvent event='startOnMount' frames={[frameA, frameB]} setDescription={setDescription} description={t('props.startOnMount')} />
            <SwitchWithEvent event='startManually' frames={[frameA, frameB]} setDescription={setDescription} defaultChecked description={t('props.startManually')} />
            <SwitchWithEvent event='disabled' frames={[frameA, frameB]} setDescription={setDescription} description={t('props.disabled')} />
            <SwitchWithEvent event='stopOnIdle' frames={[frameA, frameB]} setDescription={setDescription} description={t('props.stopOnIdle')} />
            <SwitchWithEvent event='crossTab' frames={[frameA, frameB]} setDescription={setDescription} description={t('props.crossTab')} onChange={setCrossTab} />
            {crossTab && (
              <>
                <SwitchWithEvent event='leaderElection' frames={[frameA, frameB]} setDescription={setDescription} description={t('props.leaderElection')} />
                <NumberInputWithEvent event='syncTimers' defaultValue={0} frames={[frameA, frameB]} setDescription={setDescription} description={t('props.syncTimers')} />
              </>
            )}
          </VStack>
        </TabPanel>
        <TabPanel>
          <VStack>
            <HStack width='full'>
              <VStack width='45%'>
                <ButtonWithEvent event='start' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.start')} />
                <ButtonWithEvent event='reset' frames={[frameA]} setDescription={setDescription} description={t('methods.reset')} />
                <ButtonWithEvent event='activate' frames={[frameA]} setDescription={setDescription} description={t('methods.activate')} />
                <ButtonWithEvent event='pause' frames={[frameA]} setDescription={setDescription} description={t('methods.pause')} />
                <ButtonWithEvent event='resume' frames={[frameA]} setDescription={setDescription} description={t('methods.resume')} />
                <ButtonWithEvent event='isIdle' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.isIdle')} />
                <ButtonWithEvent event='isPrompted' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.isPrompted')} />
                <ButtonWithEvent event='isLeader' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.isLeader')} />
                <ButtonWithEvent event='isLastActiveTab' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.isLastActiveTab')} />
                <Button w='full' disabled />
              </VStack>
              <VStack width='55%'>
                <ButtonWithEvent event='getTabId' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getTabId')} />
                <ButtonWithEvent event='getRemainingTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getRemainingTime')} />
                <ButtonWithEvent event='getElapsedTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getElapsedTime')} />
                <ButtonWithEvent event='getTotalElapsedTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getTotalElapsedTime')} />
                <ButtonWithEvent event='getLastActiveTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getLastActiveTime')} />
                <ButtonWithEvent event='getLastIdleTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getLastIdleTime')} />
                <ButtonWithEvent event='getActiveTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getActiveTime')} />
                <ButtonWithEvent event='getTotalActiveTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getTotalActiveTime')} />
                <ButtonWithEvent event='getIdleTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getIdleTime')} />
                <ButtonWithEvent event='getTotalIdleTime' frames={[frameA, frameB]} setDescription={setDescription} description={t('methods.getTotalIdleTime')} />
              </VStack>
            </HStack>
            <MessageInput event='message' frames={[frameA]} setDescription={setDescription} description={t('methods.message')} />
            <SwitchWithEvent event='emitOnSelf' frames={[frameA]} setDescription={setDescription} description={t('methods.emitOnSelf')} />
          </VStack>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

export function Demo () {
  const { t } = useTranslation('common')
  const windowA = useRef<HTMLIFrameElement>()
  const windowB = useRef<HTMLIFrameElement>()
  const [crossTab, setCrossTab] = useState<boolean>(false)
  const [description, setDescription] = useState<string>(descriptionDefault)

  return (
    <Box
      as='section'
      py={20}
    >
      <Container maxW='1280px'>
        <Box maxW='760px' mx='auto' textAlign='center' mb='56px'>
          <chakra.h2 textStyle='heading' mb='5'>
            {t('homepage.demo.title')}
          </chakra.h2>
          <chakra.p opacity={0.7} fontSize='lg'>
            {t('homepage.demo.description')}
          </chakra.p>
        </Box>
        <Grid
          templateColumns={{ base: 'repeat(1, 1fr)', md: crossTab ? '350px 1fr 1fr' : '350px 1fr' }}
          gap={10}
          px={{ md: 12 }}
        >
          <ControlPanel
            frameA={windowA}
            frameB={windowB}
            crossTab={crossTab}
            setCrossTab={setCrossTab}
            setDescription={setDescription}
          />
          <Window ref={windowA} url='/demo?hideControls=true&startManually' />
          {crossTab && (
            <Window ref={windowB} url='/demo?hideControls=true&startManually' />
          )}
        </Grid>
        <Flex
          align='center'
          p={2}
          mt={8}
          mx={{ md: 12 }}
          display={{ base: 'none', md: 'flex' }}
          borderRadius={4}
          bg={useColorModeValue('gray.100', 'gray.700')}
          borderLeftColor='red.400'
          borderLeftStyle='solid'
          borderLeftWidth={2}
        >
          <Icon as={BsInfoLg} ml={2} mr={3} color='red.400' />
          <Text>{description}</Text>
        </Flex>
      </Container>
    </Box>
  )
}
